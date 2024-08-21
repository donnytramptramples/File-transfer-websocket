document.addEventListener('DOMContentLoaded', () => {
    const socket = new WebSocket('ws://localhost:3000'); // Connect to WebSocket server

    let fileToSend = null;

    const fileInput = document.getElementById('file-input');
    const sendBtn = document.getElementById('send-btn');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const uploadSpeedText = document.getElementById('upload-speed');

    // Handle WebSocket open event
    socket.addEventListener('open', () => {
        console.log('Connected to WebSocket server');
    });

    // Handle incoming messages from the server
    socket.addEventListener('message', (event) => {
        // Handle incoming messages, e.g., update UI
        console.log('Message from server:', event.data);
    });

    // Handle file input change
    fileInput.addEventListener('change', (event) => {
        fileToSend = event.target.files[0];
    });

    // Handle file upload button click
    sendBtn.addEventListener('click', () => {
        if (fileToSend) {
            handleFileUpload(fileToSend);
        } else {
            alert('No file selected!');
        }
    });

    // Function to handle file upload with progress
    const handleFileUpload = (file) => {
        const reader = new FileReader();

        reader.onloadstart = () => {
            uploadProgress.classList.remove('hidden');
        };

        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = (event.loaded / event.total) * 100;
                progressBar.style.width = `${percent}%`;
                const totalMB = (event.total / 1024 / 1024).toFixed(2);
                const loadedMB = (event.loaded / 1024 / 1024).toFixed(2);
                progressText.textContent = `${loadedMB} MB of ${totalMB} MB (${Math.round(percent)}%)`;
            }
        };

        reader.onloadend = () => {
            uploadProgress.classList.add('hidden');
        };

        reader.onload = () => {
            socket.send(JSON.stringify({
                type: 'file',
                fileName: file.name,
                fileBuffer: Array.from(new Uint8Array(reader.result))
            }));
            fileToSend = null;
            fileInput.value = '';
        };

        reader.readAsArrayBuffer(file);
    };
});
