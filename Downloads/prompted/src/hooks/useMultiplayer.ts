import { useEffect } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { useGame } from '../context/GameContext';
import { GamePhase, Player } from '../types';
import { getRandomSlots, getRandomWord } from '../services/geminiService';
import { PEER_PREFIX, PUBLIC_LOBBY_ID } from '../lib/constants';
import { createPlayer } from '../lib/gameUtils';
import { AVATAR_COLORS } from '../lib/constants';

export const useMultiplayer = () => {
    const {
        gameState, setGameState,
        isHost, setIsHost,
        setMyId, myId,
        peerRef, connectionsRef,
        setChatMessages,
        addGraffitiLocally,
        playMode,
        roomCode,
        myPlayer
    } = useGame();

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        };
    }, []);

    const handleData = (data: any, senderConn?: DataConnection) => {
        // Protocol: { type: string, payload: any }

        switch (data.type) {
            case 'GAME_STATE_UPDATE':
                // Client receives full state from Host
                if (!isHost) {
                    setGameState(data.payload);
                }
                break;

            case 'PLAYER_JOINED':
                // Host receives join request
                if (isHost) {
                    const newPlayer = data.payload;
                    // Check if player already exists
                    setGameState(prev => {
                        if (prev.players.find(p => p.id === newPlayer.id)) return prev;
                        const updated = { ...prev, players: [...prev.players, newPlayer] };
                        broadcastState(updated);
                        return updated;
                    });
                }
                break;

            case 'ACTION_SUBMIT_DRAWING':
                if (isHost) {
                    setGameState(prev => {
                        const players = prev.players.map(p =>
                            p.id === data.payload.id ? { ...p, drawing: data.payload.drawing } : p
                        );
                        const updated = { ...prev, players };
                        // Check if all joined have submitted? handled in useGameHost loop usually
                        broadcastState(updated);
                        return updated;
                    });
                }
                break;

            case 'ACTION_VOTE':
                if (isHost && senderConn) {
                    setGameState(prev => {
                        // Check if player already voted to prevent double counting if needed?
                        // Ideally we track who voted for whom
                        const voters = prev.players.map(p => {
                            if (p.id === data.payload.voterId) {
                                return { ...p, votedTargetId: data.payload.targetId };
                            }
                            return p;
                        });

                        // Calculate scores immediately or wait? 
                        // Let's just store specific votes for now and tally later or tally live.
                        // Simple tally:
                        const players = voters.map(p => {
                            if (p.id === data.payload.targetId) {
                                return { ...p, votesReceived: p.votesReceived + 1, score: p.score + 100 };
                            }
                            return p;
                        });

                        const updated = { ...prev, players };
                        broadcastState(updated);
                        return updated;
                    });
                }
                break;

            case 'CHAT_MESSAGE':
                setChatMessages(prev => [...prev, data.payload]);
                // If Host, broadcast to others
                if (isHost) {
                    broadcastData({ type: 'CHAT_MESSAGE', payload: data.payload }, senderConn?.peer);
                }
                break;

            case 'GRAFFITI_EVENT':
                addGraffitiLocally(data.payload);
                if (isHost) {
                    broadcastData({ type: 'GRAFFITI_EVENT', payload: data.payload }, senderConn?.peer);
                }
                break;
        }
    };

    const broadcastState = (state: any) => {
        connectionsRef.current.forEach(conn => {
            if (conn.open) {
                conn.send({ type: 'GAME_STATE_UPDATE', payload: state });
            }
        });
    };

    const broadcastData = (data: any, excludePeerId?: string) => {
        connectionsRef.current.forEach(conn => {
            if (conn.open && conn.peer !== excludePeerId) {
                conn.send(data);
            }
        });
    };

    const handleCreateRoom = (code: string, name: string, avatarIdx: number, color: string) => {
        setIsHost(true);

        // Add Host as first player
        const hostPlayer: Player = {
            ...createPlayer('host', name, avatarIdx),
            avatarColor: color,
            slots: getRandomSlots(),
            id: 'host'
        };

        setGameState(prev => ({
            ...prev,
            phase: GamePhase.LOBBY_WAITING,
            players: [hostPlayer],
            settings: { ...prev.settings, roomCode: code }
        }));

        const peerId = playMode === 'random' ? `${PEER_PREFIX}${PUBLIC_LOBBY_ID}` : `${PEER_PREFIX}${code}`;

        const peer = new Peer(peerId);
        peer.on('open', (id) => {
            console.log('Host Peer ID:', id);
        });

        peer.on('connection', (conn) => {
            console.log('Host received connection');
            connectionsRef.current.push(conn);

            conn.on('data', (data: any) => handleData(data, conn));

            conn.on('close', () => {
                connectionsRef.current = connectionsRef.current.filter(c => c !== conn);
                // Handle player disconnect logic if needed
            });
        });

        peerRef.current = peer;
    };

    const handleJoinRoom = (code: string, name: string, avatarIdx: number, color: string) => {
        setIsHost(false);
        const myPeerId = `${PEER_PREFIX}${Math.random().toString(36).substr(2, 9)}`;
        setMyId(myPeerId); // Actually this is the peer id, but player id logic might differ.
        // Let's use peer id as player id for CLIENTS. Host is always 'host'.

        const peer = new Peer(myPeerId);
        peerRef.current = peer;

        peer.on('open', () => {
            const hostId = code === 'PUBLIC' ? `${PEER_PREFIX}${PUBLIC_LOBBY_ID}` : `${PEER_PREFIX}${code}`;
            const conn = peer.connect(hostId);

            conn.on('open', () => {
                console.log('Connected to host');
                connectionsRef.current = [conn];

                // Send Join Request
                const playerInfo = {
                    ...createPlayer(myPeerId, name, avatarIdx),
                    avatarColor: color,
                    slots: getRandomSlots() // Client generates own slots initially? Or host assigns?
                    // Let's say client generates for now for simplicity of "everyone gets different prompt"
                };
                conn.send({ type: 'PLAYER_JOINED', payload: playerInfo });
            });

            conn.on('data', (data: any) => handleData(data));
            conn.on('close', () => console.log('Disconnected from host'));

            // Re-connection logic?
        });
    };

    const sendClientAction = (type: string, payload: any) => {
        if (isHost) {
            // Processing local host action?
            // Usually Host calls logic directly, but for Graffiti/Chat:
            if (type === 'GRAFFITI_EVENT') {
                broadcastData({ type, payload }); // Host broadcasts to others
            }
        } else {
            console.log('Sending client action', type);
            connectionsRef.current.forEach(conn => {
                if (conn.open) conn.send({ type, payload });
            });
        }
    };

    return {
        handleCreateRoom,
        handleJoinRoom,
        sendClientAction,
        broadcastState
    };
};
