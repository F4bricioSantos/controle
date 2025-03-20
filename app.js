        let device, characteristic;
        let lastDirectionSent = null;
        let lastSpeedSent = null;
        let directionTouchId = null;
        let speedTouchId = null;

        async function connectBluetooth() {
            try {
                device = await navigator.bluetooth.requestDevice({
                    acceptAllDevices: true, // Remove filtro para listar todos os dispositivos
                    optionalServices: ['00001101-0000-1000-8000-00805f9b34fb']
                });
                const server = await device.gatt.connect();
                const service = await server.getPrimaryService('00001101-0000-1000-8000-00805f9b34fb');
                characteristic = await service.getCharacteristic('00001101-0000-1000-8000-00805f9b34fb');
                alert('Conectado ao HC-05!');
            } catch (error) {
                console.error('Erro ao conectar:', error);
                alert('Falha na conexão: ' + error.message);
            }
        }

        async function sendBluetooth(data) {
            if (characteristic) {
                try {
                    const encoder = new TextEncoder();
                    await characteristic.writeValue(encoder.encode(data + '\n'));
                    console.log('Enviado:', data);
                } catch (error) {
                    console.error('Erro ao enviar:', error);
                }
            }
        }

        function setupDirectionJoystick() {
            const joystick = document.getElementById('directionJoystick');
            const stick = document.getElementById('directionStick');
            const info = document.getElementById('directionInfo');
            let isDragging = false;

            function updatePosition(x) {
                const rect = joystick.getBoundingClientRect();
                const centerX = rect.width / 2;
                const maxDistance = rect.width * 0.35;
                let dx = x - centerX;
                if (Math.abs(dx) > maxDistance) {
                    dx = dx > 0 ? maxDistance : -maxDistance;
                }

                stick.style.left = (centerX + dx - stick.offsetWidth / 2) + 'px';
                stick.style.top = (rect.height / 2 - stick.offsetHeight / 2) + 'px';

                const value = Math.round((dx / maxDistance + 1) * 90);
                const command = `D${value}`;
                info.textContent = `Direção: ${command}`;

                if (command !== lastDirectionSent) {
                    sendBluetooth(command);
                    lastDirectionSent = command;
                }
            }

            function resetPosition() {
                const rect = joystick.getBoundingClientRect();
                stick.style.left = (rect.width / 2 - stick.offsetWidth / 2) + 'px';
                stick.style.top = (rect.height / 2 - stick.offsetHeight / 2) + 'px';
                info.textContent = 'Direção: D90';
                const command = 'D90';
                if (command !== lastDirectionSent) {
                    sendBluetooth(command);
                    lastDirectionSent = command;
                }
            }

            stick.addEventListener('mousedown', () => isDragging = true);
            joystick.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    const rect = joystick.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    updatePosition(x);
                }
            });
            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    resetPosition();
                }
            });

            stick.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                directionTouchId = touch.identifier;
            });
            joystick.addEventListener('touchmove', (e) => {
                e.preventDefault();
                for (let touch of e.touches) {
                    if (touch.identifier === directionTouchId) {
                        const rect = joystick.getBoundingClientRect();
                        const x = touch.clientX - rect.left;
                        updatePosition(x);
                        break;
                    }
                }
            });
            document.addEventListener('touchend', (e) => {
                for (let touch of e.changedTouches) {
                    if (touch.identifier === directionTouchId) {
                        directionTouchId = null;
                        resetPosition();
                        break;
                    }
                }
            });
        }

        function setupSpeedJoystick() {
            const joystick = document.getElementById('speedJoystick');
            const stick = document.getElementById('speedStick');
            const info = document.getElementById('speedInfo');
            let isDragging = false;

            function updatePosition(y) {
                const rect = joystick.getBoundingClientRect();
                const centerY = rect.height / 2;
                const maxDistance = rect.height * 0.35;
                let dy = y - centerY;
                if (Math.abs(dy) > maxDistance) {
                    dy = dy > 0 ? maxDistance : -maxDistance;
                }

                stick.style.top = (centerY + dy - stick.offsetHeight / 2) + 'px';
                stick.style.left = (rect.width / 2 - stick.offsetWidth / 2) + 'px';

                const value = Math.round((dy / maxDistance + 1) * 90);
                const command = `G${value}`;
                info.textContent = `Aceleração: ${command}`;

                if (command !== lastSpeedSent) {
                    sendBluetooth(command);
                    lastSpeedSent = command;
                }
            }

            function resetPosition() {
                const rect = joystick.getBoundingClientRect();
                stick.style.top = (rect.height / 2 - stick.offsetHeight / 2) + 'px';
                stick.style.left = (rect.width / 2 - stick.offsetWidth / 2) + 'px';
                info.textContent = 'Aceleração: G0';
                const command = 'G0';
                if (command !== lastSpeedSent) {
                    sendBluetooth(command);
                    lastSpeedSent = command;
                }
            }

            stick.addEventListener('mousedown', () => isDragging = true);
            joystick.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    const rect = joystick.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    updatePosition(y);
                }
            });
            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    resetPosition();
                }
            });

            stick.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                speedTouchId = touch.identifier;
            });
            joystick.addEventListener('touchmove', (e) => {
                e.preventDefault();
                for (let touch of e.touches) {
                    if (touch.identifier === speedTouchId) {
                        const rect = joystick.getBoundingClientRect();
                        const y = touch.clientY - rect.top;
                        updatePosition(y);
                        break;
                    }
                }
            });
            document.addEventListener('touchend', (e) => {
                for (let touch of e.changedTouches) {
                    if (touch.identifier === speedTouchId) {
                        speedTouchId = null;
                        resetPosition();
                        break;
                    }
                }
            });
        }

        setupDirectionJoystick();
        setupSpeedJoystick();
