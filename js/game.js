// 创建背景泡泡
function createBackgroundBubbles() {
    const container = document.getElementById('backgroundBubbles');
    const bubbleCount = 20;
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // 随机大小和位置
        const size = Math.random() * 200 + 30;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.top = `${Math.random() * 100}%`;
        
        // 随机动画延迟
        bubble.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(bubble);
    }
}

// 乐曲到音频文件的映射 (完整乐曲)
const songAudioFiles = {
    // 'twinkle': 'js/sounds/songs/Tewinkle-Tewinkle-little-Star.mp3',
    'moonlight': 'js/sounds/songs/MIXUE-Ice-Cream-&-Tea-Song.mp3',
    'ode': 'js/sounds/songs/Old-MacDonald-Had-a-Farm.mp3',
    'cloud': 'js/sounds/songs/ODE-TO-JOY.mp3'
};

// 乐曲名称映射
const songNames = {
    // 'twinkle': 'Tewinkle-Tewinkle-little-Star',
    'moonlight': 'MIXUE-Ice-Cream-&-Tea-Song',
    'ode': 'Old-MacDonald-Had-a-Farm',
    'cloud': 'ODE-TO-JOY'
};

// 每首歌曲的音符切片数量
const songNoteCounts = {
    // 'twinkle': 25,
    'moonlight':25,
    'ode': 24,
    'cloud': 27
};

// 游戏状态
const gameState = {
    bubbles: [],
    activeBubbleIndex: -1,
    currentMelody: [], // 这里将存储当前歌曲的音符索引序列
    currentNoteIndex: 0,
    gameStarted: false,
    gameOver: false,
    timer: 60,
    timerInterval: null,
    currentSong: 'twinkle',
    audioContext: null,
    noteBuffers: {}, // 存储加载的音符切片音频
    songBuffer: null, // 存储完整乐曲音频
    activeSources: [], // 存储当前活跃的音频源，用于停止播放
    totalNotesInSong: 0 // 当前歌曲的总音符数
};

// 初始化Canvas
const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    createBubbles();
}

// 创建泡泡
function createBubbles() {
    gameState.bubbles = [];
    gameState.totalNotesInSong = songNoteCounts[gameState.currentSong] || 14; // 默认14个音符
    gameState.currentMelody = []; // 重置当前旋律

    // 生成当前歌曲的音符索引序列 (1 到 totalNotesInSong)
    for (let i = 1; i <= gameState.totalNotesInSong; i++) {
        gameState.currentMelody.push(i);
    }

    // 确保每个音符至少有一个泡泡
    for (let i = 0; i < gameState.currentMelody.length; i++) {
        const radius = Math.random() * 40 + 30;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        
        const noteIndex = gameState.currentMelody[i]; // 音符索引
        
        gameState.bubbles.push({
            x, y, radius,
            noteIndex: noteIndex, // 存储音符索引而不是字母
            color: '#aaaaaa', // 默认灰色
            active: false,
            collected: false,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8
        });
    }
    
    // 添加额外的泡泡，总数为20个
    const extraBubbleCount = Math.max(1, 20 - gameState.currentMelody.length);
    
    for (let i = 0; i < extraBubbleCount; i++) {
        const radius = Math.random() * 40 + 30;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        
        // 随机分配旋律中的音符索引
        const noteIndexIndex = Math.floor(Math.random() * gameState.currentMelody.length);
        const noteIndex = gameState.currentMelody[noteIndexIndex]; // 获取音符索引
        
        gameState.bubbles.push({
            x, y, radius,
            noteIndex: noteIndex,
            color: '#aaaaaa', // 默认灰色
            active: false,
            collected: false,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8
        });
    }
    
    // 激活第一个泡泡
    activateNextBubble();
}

// 为特定音符索引创建新泡泡
function createNewBubbleForNote(noteIndex) {
    // 检查音符索引是否有效
    if (noteIndex === undefined || noteIndex === null) {
        console.warn('尝试为未定义的音符索引创建泡泡');
        return;
    }
    
    const radius = Math.random() * 40 + 30;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    
    const newBubble = {
        x, y, radius,
        noteIndex: noteIndex,
        color: getBubbleColor(noteIndex),
        active: true,
        collected: false,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8
    };
    
    gameState.bubbles.push(newBubble);
    gameState.activeBubbleIndex = gameState.bubbles.length - 1;
    
    // 更新当前音符显示 (显示索引)
    document.getElementById('currentNoteDisplay').textContent = noteIndex;
}

// 按照旋律顺序激活下一个泡泡
function activateNextBubble() {
    // 重置所有泡泡状态
    gameState.bubbles.forEach(bubble => {
        bubble.active = false;
        bubble.color = '#aaaaaa';
    });
    
    // 获取当前应该激活的音符索引
    const currentNoteIndexValue = gameState.currentMelody[gameState.currentNoteIndex];
    
    // 检查当前音符索引是否有效
    if (currentNoteIndexValue === undefined) {
        console.warn('当前音符索引未定义，可能是旋律数据有误');
        document.getElementById('currentNoteDisplay').textContent = '-';
        return;
    }
    
    // 从未收集的泡泡中找到匹配当前音符索引的泡泡
    const availableBubbles = gameState.bubbles.filter(b => !b.collected && b.noteIndex === currentNoteIndexValue);
    
    if (availableBubbles.length > 0) {
        // 如果有匹配的泡泡，随机选择一个（可能有多个相同音符的泡泡）
        const randomIndex = Math.floor(Math.random() * availableBubbles.length);
        const bubble = availableBubbles[randomIndex];
        
        bubble.active = true;
        bubble.color = getBubbleColor(bubble.noteIndex);
        gameState.activeBubbleIndex = gameState.bubbles.indexOf(bubble);
        
        // 更新当前音符显示 (显示索引)
        document.getElementById('currentNoteDisplay').textContent = bubble.noteIndex;
    } else {
        // 如果没有匹配的泡泡（可能已经全部收集），创建一个新的泡泡
        createNewBubbleForNote(currentNoteIndexValue);
    }
}

// 根据音符索引获取泡泡颜色
function getBubbleColor(noteIndex) {
    // 使用模运算来循环分配颜色，确保即使音符很多也能有颜色
    const colors = [
        '#FF5252', // 红色 0
        '#FFEB3B', // 黄色 1
        '#4CAF50', // 绿色 2
        '#2196F3', // 蓝色 3
        '#9C27B0', // 紫色 4
        '#FF9800', // 橙色 5
        '#00BCD4'  // 青色 6
    ];
    
    const colorIndex = (noteIndex - 1) % colors.length; // 索引从1开始，所以减1
    return colors[colorIndex] || '#FF5252';
}

// 绘制泡泡
function drawBubbles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    gameState.bubbles.forEach(bubble => {
        if (bubble.collected) return;
        
        // 绘制泡泡
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        
        // 泡泡填充
        const gradient = ctx.createRadialGradient(
            bubble.x, bubble.y, 0,
            bubble.x, bubble.y, bubble.radius
        );
        
        if (bubble.active) {
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.3, bubble.color);
            gradient.addColorStop(1, 'rgba(100, 100, 100, 0.1)');
        } else {
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(0.3, bubble.color);
            gradient.addColorStop(1, 'rgba(50, 50, 50, 0.1)');
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 泡泡边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制音符索引
        ctx.font = `${bubble.radius * 1}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(bubble.noteIndex.toString(), bubble.x, bubble.y);
    });
}

// 更新泡泡位置
function updateBubbles() {
    gameState.bubbles.forEach(bubble => {
        if (bubble.collected) return;
        
        // 更新位置
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;
        
        // 边界检测
        if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > canvas.width) {
            bubble.vx *= -1;
        }
        if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > canvas.height) {
            bubble.vy *= -1;
        }
    });
}

// 检查文件是否存在
async function checkFileExists(url) {
    try {
        const response = await fetch(url, { 
            method: 'HEAD' // 使用 HEAD 请求检查文件是否存在
        });
        return response.ok;
    } catch (error) {
        console.error(`检查文件存在时出错: ${url}`, error);
        return false;
    }
}

// 加载音频文件
async function loadAudioFiles() {
    try {
        console.log('开始加载音频文件...');
        
        // 清空之前的音符缓冲区
        gameState.noteBuffers = {};
        
        // 加载当前歌曲的音符切片音频 (根据索引)
        const totalNotes = gameState.totalNotesInSong;
        for (let i = 1; i <= totalNotes; i++) {
            try {
                // 构造音符切片文件路径
                let audioPath = `js/sounds/${gameState.currentSong}/${i}.mp3`;
                console.log(`正在加载歌曲 ${gameState.currentSong} 的音符切片 ${i}: ${audioPath}`);
                
                // 检查MP3文件是否存在
                let exists = await checkFileExists(audioPath);
                
                // 如果MP3文件不存在，尝试加载WAV文件
                if (!exists) {
                    console.warn(`音符切片 ${i} 的MP3文件不存在: ${audioPath}`);
                    // 尝试使用WAV格式
                    audioPath = `js/sounds/${gameState.currentSong}/${i}.wav`;
                    console.log(`尝试加载WAV格式: ${audioPath}`);
                    exists = await checkFileExists(audioPath);
                    
                    if (!exists) {
                        console.warn(`音符切片 ${i} 的WAV文件也不存在: ${audioPath}`);
                        continue; // 跳过这个音符
                    }
                }
                
                // // 尝试加载文件
                try {
                    const response = await fetch(audioPath);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await gameState.audioContext.decodeAudioData(arrayBuffer);
                    gameState.noteBuffers[i] = audioBuffer; // 使用索引作为键
                    console.log(`音符切片 ${i} 的音频加载成功`);
                } catch (fetchError) {
                    console.error(`获取音符切片 ${i} 的音频文件时出错:`, fetchError);
                    // 如果是MP3格式失败，尝试WAV格式
                    if (audioPath.endsWith('.mp3')) {
                        const wavPath = audioPath.replace('.mp3', '.wav');
                        try {
                            console.log(`尝试加载WAV格式作为备选: ${wavPath}`);
                            const wavResponse = await fetch(wavPath);
                            if (wavResponse.ok) {
                                const wavArrayBuffer = await wavResponse.arrayBuffer();
                                const wavAudioBuffer = await gameState.audioContext.decodeAudioData(wavArrayBuffer);
                                gameState.noteBuffers[i] = wavAudioBuffer; // 使用索引作为键
                                console.log(`音符切片 ${i} 的WAV音频加载成功`);
                            }
                        } catch (wavError) {
                            console.error(`加载音符切片 ${i} 的WAV音频时出错:`, wavError);
                        }
                    }
                }
            } catch (noteError) {
                console.error(`加载音符切片 ${i} 的音频时出错:`, noteError);
            }
        }
        
        // 加载当前歌曲的完整音频
        try {
            const songPath = songAudioFiles[gameState.currentSong];
            if (songPath) {
                console.log(`正在加载歌曲完整音频: ${songPath}`);
                
                // 检查文件是否存在
                const exists = await checkFileExists(songPath);
                if (!exists) {
                    console.warn(`歌曲完整音频文件不存在: ${songPath}`);
                } else {
                    try {
                        const songResponse = await fetch(songPath);
                        if (!songResponse.ok) {
                            throw new Error(`HTTP error! status: ${songResponse.status}`);
                        }
                        const songArrayBuffer = await songResponse.arrayBuffer();
                        gameState.songBuffer = await gameState.audioContext.decodeAudioData(songArrayBuffer);
                        console.log('歌曲完整音频加载成功');
                    } catch (fetchError) {
                        console.error('获取歌曲完整音频文件时出错:', fetchError);
                    }
                }
            } else {
                 console.warn(`未找到歌曲 "${gameState.currentSong}" 的完整音频路径`);
            }
        } catch (songError) {
            console.error('加载歌曲完整音频时出错:', songError);
        }
        
        console.log('所有音频文件加载完成');
    } catch (error) {
        console.error('加载音频文件时出错:', error);
    }
}

// 播放音符 (根据索引播放)
function playNote(noteIndex) {
    // 确保 noteIndex 是数字
    const index = Number(noteIndex);
    if (isNaN(index) || !gameState.noteBuffers[index]) {
        console.warn(`音符切片 ${noteIndex} 的音频未加载或无效`);
        return;
    }
    
    const source = gameState.audioContext.createBufferSource();
    source.buffer = gameState.noteBuffers[index];
    source.connect(gameState.audioContext.destination);
    source.start();
    
    // 将音频源添加到活跃源列表
    gameState.activeSources.push(source);
    
    // 音频播放结束后从列表中移除
    source.onended = function() {
        const index = gameState.activeSources.indexOf(source);
        if (index !== -1) {
            gameState.activeSources.splice(index, 1);
        }
    };
}

// 播放完整旋律
function playMelody() {
    if (!gameState.songBuffer) {
        console.warn('歌曲完整音频未加载');
        return;
    }
    
    const source = gameState.audioContext.createBufferSource();
    source.buffer = gameState.songBuffer;
    source.connect(gameState.audioContext.destination);
    source.start();
    
    // 将音频源添加到活跃源列表
    gameState.activeSources.push(source);
    
    // 音频播放结束后从列表中移除
    source.onended = function() {
        const index = gameState.activeSources.indexOf(source);
        if (index !== -1) {
            gameState.activeSources.splice(index, 1);
        }
    };
}

// 显示错误消息
function showErrorMessage(message) {
    // 检查是否已存在错误消息元素
    let errorElement = document.getElementById('audioErrorMessage');
    
    // 如果不存在，创建一个
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'audioErrorMessage';
        errorElement.className = 'game-message error-message';
        document.querySelector('.game-area').appendChild(errorElement);
        
        // 添加样式
        errorElement.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        errorElement.style.color = 'white';
        errorElement.style.padding = '15px';
        errorElement.style.borderRadius = '10px';
        errorElement.style.position = 'absolute';
        errorElement.style.top = '50%';
        errorElement.style.left = '50%';
        errorElement.style.transform = 'translate(-50%, -50%)';
        errorElement.style.zIndex = '1000';
        errorElement.style.maxWidth = '80%';
        errorElement.style.textAlign = 'center';
    }
    
    // 设置消息内容
    errorElement.innerHTML = `
        <h2 class="message-title"><i class="fas fa-exclamation-triangle"></i> 音频加载错误</h2>
        <div class="message-content">${message}</div>
        <div class="message-content">请检查音频文件是否存在或刷新页面重试。</div>
        <button class="action-button primary-btn" onclick="location.reload()">
            <i class="fas fa-redo"></i> 刷新页面
        </button>
    `;
    
    // 显示错误消息
    errorElement.style.display = 'block';
}

// 开始游戏
async function startGame() {
    if (gameState.gameStarted) return;
    
    try {
        // 初始化Web Audio API
        if (!gameState.audioContext) {
            gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } else if (gameState.audioContext.state === 'suspended') {
             await gameState.audioContext.resume();
        }
        
        // 加载音频文件
        await loadAudioFiles();
        
        // 检查是否至少有一个音符音频加载成功
        const hasLoadedNotes = Object.keys(gameState.noteBuffers).length > 0;
        
        if (!hasLoadedNotes) {
            throw new Error('没有成功加载任何音符切片音频文件');
        }
        
        gameState.gameStarted = true;
        gameState.gameOver = false;
        gameState.timer = 60;
        gameState.currentNoteIndex = 0;
        
        // 获取当前歌曲的总音符数
        gameState.totalNotesInSong = songNoteCounts[gameState.currentSong] || 14;
        
        // 更新进度显示
        document.getElementById('progressText').textContent = gameState.currentNoteIndex;
        document.getElementById('progressBar').style.width = '0%';
        
        // 重置泡泡
        gameState.bubbles.forEach(bubble => {
            bubble.collected = false;
        });
        
        // 更新总音符数
        document.getElementById('totalNotes').textContent = gameState.totalNotesInSong;
        
        // 重置进度
        document.getElementById('progressText').textContent = '0';
        document.getElementById('progressBar').style.width = '0%';
        
        // 激活第一个泡泡
        activateNextBubble();
        
        // 隐藏消息
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('timeoutMessage').style.display = 'none';
        
        // 隐藏可能存在的错误消息
        const errorElement = document.getElementById('audioErrorMessage');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        // 启动计时器
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }
        
        gameState.timerInterval = setInterval(() => {
            gameState.timer--;
            document.querySelector('.timer-display').textContent = gameState.timer;
            
            // 更新进度条
            const progress = ((60 - gameState.timer) / 60) * 100;
            document.getElementById('progressBar').style.width = `${progress}%`;
            
            if (gameState.timer <= 0) {
                endGame(false);
            }
        }, 1000);
    } catch (error) {
        console.error('游戏启动失败:', error);
        showErrorMessage('音频文件加载失败，游戏无法启动。请确保音频文件存在并且可访问。');
    }
}

// 重置游戏
function resetGame() {
    gameState.gameStarted = false;
    gameState.gameOver = false;
    
    // 停止所有音频播放
    stopAllAudio();
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    document.querySelector('.timer-display').textContent = '60';
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressText').textContent = '0';
    document.getElementById('currentNoteDisplay').textContent = '-';
    
    createBubbles();
    drawBubbles();
    
    // 激活第一个泡泡
    activateNextBubble();
    
    // 隐藏消息
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('timeoutMessage').style.display = 'none';
}

// 结束游戏
function endGame(success) {
    gameState.gameOver = true;
    gameState.gameStarted = false;
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    if (success) {
        document.getElementById('successMessage').style.display = 'block';
        playMelody();
    } else {
        document.getElementById('timeoutMessage').style.display = 'block';
    }
}

// 点击泡泡事件
function handleBubbleClick(event) {
    if (!gameState.gameStarted || gameState.gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    gameState.bubbles.forEach((bubble, index) => {
        if (bubble.collected) return;
        
        const distance = Math.sqrt(
            Math.pow(mouseX - bubble.x, 2) + 
            Math.pow(mouseY - bubble.y, 2)
        );
        
        if (distance <= bubble.radius && bubble.active) {
            // 播放音符 (传递音符索引)
            playNote(bubble.noteIndex);
            
            // 标记为已收集
            bubble.collected = true;
            
            // 更新进度
            gameState.currentNoteIndex++;
            document.getElementById('progressText').textContent = gameState.currentNoteIndex;
            
            // 更新进度条
            const progressPercentage = (gameState.currentNoteIndex / gameState.totalNotesInSong) * 100;
            document.getElementById('progressBar').style.width = `${progressPercentage}%`;
            
            // 检查是否完成
            if (gameState.currentNoteIndex >= gameState.totalNotesInSong) {
                endGame(true);
            } else {
                // 激活下一个泡泡
                activateNextBubble();
            }
        }
    });
}

// 动画循环
function animate() {
    if (gameState.gameStarted && !gameState.gameOver) {
        updateBubbles();
        drawBubbles();
    }
    requestAnimationFrame(animate);
}

// 停止所有音频播放
function stopAllAudio() {
    // 停止所有活跃的音频源
    if (gameState.activeSources && gameState.activeSources.length > 0) {
        console.log(`停止 ${gameState.activeSources.length} 个活跃的音频源`);
        gameState.activeSources.forEach(source => {
            try {
                source.stop();
            } catch (error) {
                // 忽略已经停止的音频源
                console.log('停止音频源时出错，可能已经停止:', error);
            }
        });
        // 清空活跃源列表
        gameState.activeSources = [];
    }
}

// 返回首页
function backToHome() {
    // 停止所有音频播放
    stopAllAudio();
    window.location.href = 'index.html';
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 创建背景泡泡
    createBackgroundBubbles();
    
    // 从sessionStorage获取选择的歌曲
    const selectedSong = sessionStorage.getItem('selectedSong') || 'twinkle';
    gameState.currentSong = selectedSong;
    
    // 显示当前歌曲名称
    document.getElementById('currentSongDisplay').textContent = songNames[selectedSong] || '小星星';
    
    // 初始化Canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 设置事件监听器
    canvas.addEventListener('click', handleBubbleClick);
    document.getElementById('backToHomeBtn').addEventListener('click', backToHome);
    document.getElementById('backToHomeBtn2').addEventListener('click', backToHome);
    document.getElementById('backToHomeBtn3').addEventListener('click', backToHome);
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        resetGame();
        startGame();
    });
    document.getElementById('retryBtn').addEventListener('click', () => {
        resetGame();
        startGame();
    });
    
    // 开始游戏
    startGame();
    
    // 开始动画
    animate();
});



