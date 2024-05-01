import React, { useEffect, useState } from 'react';
import Peer from 'peerjs';
import { saveAs } from 'file-saver';

const FileTransferView = ({ files, config, toggleFileDragged }) => {
    const [clients, setClients] = useState([]);
    const [peerId, setPeerId] = useState(null);
    const [peer] = useState(new Peer());
    const [targetPeerId, setTargetPeerId] = useState('');

    useEffect(() => {
        peer.on('open', (id) => {
            console.log('My peer ID is:', id);
            setPeerId(id);
        });

        peer.on('connection', (conn) => {
            conn.on('data', (data) => {
                saveFile(data);
            });
        });
    }, [peer]);

    function sendFile(file, targetPeerId) {
        const conn = peer.connect(targetPeerId);

        conn.on('open', () => {
            const reader = new FileReader();
            reader.onload = () => {
                conn.send(reader.result);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    function saveFile(data) {
        const blob = new Blob([data]);
        saveAs(blob, 'received_file');
    }

    const handleFileSend = () => {
        // 假设只发送第一个文件
        if (files.length > 0) {
            sendFile(files[0], targetPeerId);
        } else {
            console.log('No files to send');
        }
    };

    return (
        <div
            style={{ backgroundColor: config.colorScheme }}
            className="flex flex-col w-screen h-screen z-10 max-h-200 p-2 text-ellipsis overflow-hidden items-center justify-center rounded-xl relative"
            // onClick={toggleFileDragged}
        >
            <ul>
                {files.map((file, index) => (
                    <li key={index}>
                        Name: {file.name}, Path: {file.path}
                    </li>
                ))}
                <li>
                    Connected Clients:
                    {clients.map((client, idx) => (
                        <div key={idx}>{client}</div>
                    ))}
                </li>
            </ul>
            <p>My peer ID: {peerId}</p>
            <input
                type="text"
                placeholder="Enter target Peer ID"
                value={targetPeerId}
                onChange={(e) => setTargetPeerId(e.target.value)}
            />
            <button onClick={handleFileSend}>Send File</button>
        </div>
    );
};

export default FileTransferView;
