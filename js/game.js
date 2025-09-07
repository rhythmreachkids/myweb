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

// 音符到音频文件的映射
const noteAudioFiles = {
    'C': 'js/sounds/C4.mp3',
    'D': 'js/sounds/D4.mp3',
    'E': 'js/sounds/E4.mp3',
    'F': 'js/sounds/F4.mp3',
    'G': 'js/sounds/G4.mp3',
    'A': 'js/sounds/A4.mp3',
    'B': 'js/sounds/B4.mp3'
};

// 乐曲到音频文件的映射
const songAudioFiles = {
    'twinkle': 'js/sounds/songs/Tewinkle-Tewinkle-little-Star.mp3',
    'moonlight': 'js/sounds/songs/MIXUE-Ice-Cream-&-Tea-Song.mp3',
    'ode': 'js/sounds/songs/Old-MacDonald-Had-a-Farm.mp3',
    'cloud': 'js/sounds/songs/ODE-TO-JOY.mp3'
};

// 乐曲名称映射
const songNames = {
    'twinkle': 'Tewinkle-Tewinkle-little-Star',
    'moonlight': 'MIXUE-Ice-Cream-&-Tea-Song',
    'ode': 'Old-MacDonald-Had-a-Farm',
    'cloud': 'ODE-TO-JOY'
};

// 预设旋律
const melodies = {
    'twinkle': ['C', 'C', 'G', 'G', 'A', 'A', 'G', 'F', 'F', 'E', 'E', 'D', 'D', 'C'],
    'moonlight': ['E', 'G', 'G', 'A', 'G', 'E', 'C', 'C', 'D', 'E', 'E', 'D', 'C','D','E', 'G', 'G', 'A', 'G', 'E', 'C', 'C', 'D', 'E', 'E', 'D', 'C','D'],
    'ode': ['C', 'C', 'C', 'C', 'A', 'A', 'G', 'E', 'E', 'D', 'D', 'C','G','C', 'C', 'C', 'C', 'A', 'A', 'G', 'E', 'E', 'D', 'D', 'C','G'],
    'cloud': ['E', 'E', 'F', 'F', 'G', 'G', 'F', 'E','D','C','C','D','E','E','D','D','E', 'E', 'F', 'F', 'G', 'G', 'F', 'E','D','C','C','D','E','D','C','C'],
};

// 游戏状态
const gameState = {
    bubbles: [],
    activeBubbleIndex: -1,
    currentMelody: [],
    currentNoteIndex: 0,
    gameStarted: false,
    gameOver: false,
    timer: 60,
    timerInterval: null,
    currentSong: 'twinkle',
    audioContext: null,
    noteBuffers: {},
    songBuffer: null,
    activeSources: [] // 存储当前活跃的音频源，用于停止播放
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
    const melody = melodies[gameState.currentSong];
    
    // 确保每个音符至少有一个泡泡
    for (let i = 0; i < melody.length; i++) {
        const radius = Math.random() * 40 + 30;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        
        const note = melody[i];
        
        gameState.bubbles.push({
            x, y, radius,
            note: note,
            color: '#aaaaaa', // 默认灰色
            active: false,
            collected: false,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8
        });
    }
    
    // 添加额外的泡泡，总数为20个
    const extraBubbleCount = Math.max(1, 20 - melody.length);
    
    for (let i = 0; i < extraBubbleCount; i++) {
        const radius = Math.random() * 40 + 30;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        
        // 随机分配旋律中的音符
        const noteIndex = Math.floor(Math.random() * melody.length);
        const note = melody[noteIndex];
        
        gameState.bubbles.push({
            x, y, radius,
            note: note,
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

// 为特定音符创建新泡泡
function createNewBubbleForNote(note) {
    // 检查音符是否有效
    if (!note) {
        console.warn('尝试为未定义的音符创建泡泡');
        return;
    }
    
    const radius = Math.random() * 40 + 30;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    
    const newBubble = {
        x, y, radius,
        note: note,
        color: getBubbleColor(note),
        active: true,
        collected: false,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8
    };
    
    gameState.bubbles.push(newBubble);
    gameState.activeBubbleIndex = gameState.bubbles.length - 1;
    
    // 更新当前音符显示
    document.getElementById('currentNoteDisplay').textContent = note;
}

// 按照旋律顺序激活下一个泡泡
function activateNextBubble() {
    // 重置所有泡泡状态
    gameState.bubbles.forEach(bubble => {
        bubble.active = false;
        bubble.color = '#aaaaaa';
    });
    
    // 获取当前应该激活的音符
    const currentNote = gameState.currentMelody[gameState.currentNoteIndex];
    
    // 检查当前音符是否有效
    if (!currentNote) {
        console.warn('当前音符未定义，可能是旋律数据有误');
        document.getElementById('currentNoteDisplay').textContent = '-';
        return;
    }
    
    // 从未收集的泡泡中找到匹配当前音符的泡泡
    const availableBubbles = gameState.bubbles.filter(b => !b.collected && b.note === currentNote);
    
    if (availableBubbles.length > 0) {
        // 如果有匹配的泡泡，随机选择一个（可能有多个相同音符的泡泡）
        const randomIndex = Math.floor(Math.random() * availableBubbles.length);
        const bubble = availableBubbles[randomIndex];
        
        bubble.active = true;
        bubble.color = getBubbleColor(bubble.note);
        gameState.activeBubbleIndex = gameState.bubbles.indexOf(bubble);
        
        // 更新当前音符显示
        document.getElementById('currentNoteDisplay').textContent = bubble.note;
    } else {
        // 如果没有匹配的泡泡（可能已经全部收集），创建一个新的泡泡
        createNewBubbleForNote(currentNote);
    }
}

// 根据音符获取泡泡颜色
function getBubbleColor(note) {
    // 检查音符是否有效
    if (!note) {
        console.warn('尝试获取未定义音符的颜色');
        return '#CCCCCC'; // 灰色作为默认颜色
    }
    
    const colors = {
        'C': '#FF5252', // 红色
        'D': '#FFEB3B', // 黄色
        'E': '#4CAF50', // 绿色
        'F': '#2196F3', // 蓝色
        'G': '#9C27B0', // 紫色
        'A': '#FF9800', // 橙色
        'B': '#00BCD4'  // 青色
    };
    
    return colors[note] || '#FF5252';
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
        
        // 绘制音符
        ctx.font = `${bubble.radius * 1}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(bubble.note, bubble.x, bubble.y);
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
        // 使用 GET 请求代替 HEAD 请求，并只请求文件的前几个字节
        // 这样可以避免某些服务器不支持 HEAD 请求或 CORS 限制的问题
        const response = await fetch(url, { 
            method: 'GET',
            headers: {
                'Range': 'bytes=0-1' // 只请求前两个字节，减少数据传输
            }
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
        
        // 加载音符音频
        for (const note in noteAudioFiles) {
            try {
                // 尝试加载MP3文件
                let audioPath = noteAudioFiles[note];
                console.log(`正在加载音符 ${note} 的音频: ${audioPath}`);
                
                // 检查MP3文件是否存在
                let exists = await checkFileExists(audioPath);
                
                // 如果MP3文件不存在，尝试加载WAV文件
                if (!exists) {
                    console.warn(`音符 ${note} 的MP3文件不存在: ${audioPath}`);
                    // 尝试使用WAV格式
                    audioPath = audioPath.replace('.mp3', '.wav');
                    console.log(`尝试加载WAV格式: ${audioPath}`);
                    exists = await checkFileExists(audioPath);
                    
                    if (!exists) {
                        console.warn(`音符 ${note} 的WAV文件也不存在: ${audioPath}`);
                        continue;
                    }
                }
                
                // 尝试加载文件
                try {
                    const response = await fetch(audioPath);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await gameState.audioContext.decodeAudioData(arrayBuffer);
                    gameState.noteBuffers[note] = audioBuffer;
                    console.log(`音符 ${note} 的音频加载成功`);
                } catch (fetchError) {
                    console.error(`获取音符 ${note} 的音频文件时出错:`, fetchError);
                    // 如果是MP3格式失败，尝试WAV格式
                    if (audioPath.endsWith('.mp3')) {
                        const wavPath = audioPath.replace('.mp3', '.wav');
                        try {
                            console.log(`尝试加载WAV格式作为备选: ${wavPath}`);
                            const wavResponse = await fetch(wavPath);
                            if (wavResponse.ok) {
                                const wavArrayBuffer = await wavResponse.arrayBuffer();
                                const wavAudioBuffer = await gameState.audioContext.decodeAudioData(wavArrayBuffer);
                                gameState.noteBuffers[note] = wavAudioBuffer;
                                console.log(`音符 ${note} 的WAV音频加载成功`);
                            }
                        } catch (wavError) {
                            console.error(`加载音符 ${note} 的WAV音频时出错:`, wavError);
                        }
                    }
                }
            } catch (noteError) {
                console.error(`加载音符 ${note} 的音频时出错:`, noteError);
            }
        }
        
        // 加载当前歌曲音频
        try {
            const songPath = songAudioFiles[gameState.currentSong];
            console.log(`正在加载歌曲音频: ${songPath}`);
            
            // 检查文件是否存在
            const exists = await checkFileExists(songPath);
            if (!exists) {
                console.warn(`歌曲音频文件不存在: ${songPath}`);
            } else {
                try {
                    const songResponse = await fetch(songPath);
                    if (!songResponse.ok) {
                        throw new Error(`HTTP error! status: ${songResponse.status}`);
                    }
                    const songArrayBuffer = await songResponse.arrayBuffer();
                    gameState.songBuffer = await gameState.audioContext.decodeAudioData(songArrayBuffer);
                    console.log('歌曲音频加载成功');
                } catch (fetchError) {
                    console.error('获取歌曲音频文件时出错:', fetchError);
                }
            }
        } catch (songError) {
            console.error('加载歌曲音频时出错:', songError);
        }
        
        console.log('所有音频文件加载完成');
    } catch (error) {
        console.error('加载音频文件时出错:', error);
    }
}

// 播放音符
function playNote(note) {
    if (!gameState.noteBuffers[note]) {
        console.warn(`音符 ${note} 的音频未加载`);
        return;
    }
    
    const source = gameState.audioContext.createBufferSource();
    source.buffer = gameState.noteBuffers[note];
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
        console.warn('歌曲音频未加载');
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
        gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 加载音频文件
        await loadAudioFiles();
        
        // 检查是否至少有一个音符音频加载成功
        const hasLoadedNotes = Object.keys(gameState.noteBuffers).length > 0;
        
        if (!hasLoadedNotes) {
            throw new Error('没有成功加载任何音符音频文件');
        }
        
        gameState.gameStarted = true;
        gameState.gameOver = false;
        gameState.timer = 60;
        gameState.currentNoteIndex = 0;
        
        // 获取当前歌曲的旋律
        gameState.currentMelody = melodies[gameState.currentSong];
        
        // 检查当前歌曲是否存在于预设旋律中
        if (!gameState.currentMelody) {
            console.warn(`歌曲 "${gameState.currentSong}" 不存在于预设旋律中，使用默认歌曲`);
            gameState.currentSong = 'twinkle';
            gameState.currentMelody = melodies['twinkle'];
            
            // 更新显示的歌曲名称
            document.getElementById('currentSongDisplay').textContent = songNames['twinkle'] || '小星星';
        }
        
        // 更新进度显示
        document.getElementById('progressText').textContent = gameState.currentNoteIndex;
        document.getElementById('progressBar').style.width = '0%';
        
        // 重置泡泡
        gameState.bubbles.forEach(bubble => {
            bubble.collected = false;
        });
        
        // 更新总音符数
        document.getElementById('totalNotes').textContent = gameState.currentMelody.length;
        
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
            // 播放音符
            playNote(bubble.note);
            
            // 标记为已收集
            bubble.collected = true;
            
            // 更新进度
            gameState.currentNoteIndex++;
            document.getElementById('progressText').textContent = gameState.currentNoteIndex;
            
            // 更新进度条
            const progressPercentage = (gameState.currentNoteIndex / gameState.currentMelody.length) * 100;
            document.getElementById('progressBar').style.width = `${progressPercentage}%`;
            
            // 检查是否完成
            if (gameState.currentNoteIndex >= gameState.currentMelody.length) {
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

// 检查并修复文件路径中的重复扩展名
function fixDuplicateExtensions() {
    // 修复音符音频文件路径
    for (const note in noteAudioFiles) {
        const path = noteAudioFiles[note];
        if (path.endsWith('.mp3.mp3')) {
            noteAudioFiles[note] = path.replace('.mp3.mp3', '.mp3');
            console.log(`修复了音符 ${note} 的音频文件路径: ${noteAudioFiles[note]}`);
        }
    }
    
    // 修复歌曲音频文件路径
    for (const song in songAudioFiles) {
        const path = songAudioFiles[song];
        if (path.endsWith('.mp3.mp3')) {
            songAudioFiles[song] = path.replace('.mp3.mp3', '.mp3');
            console.log(`修复了歌曲 ${song} 的音频文件路径: ${songAudioFiles[song]}`);
        }
    }
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
    
    // 检查并修复文件路径
    fixDuplicateExtensions();
    
    // 开始游戏
    startGame();
    
    // 开始动画
    animate();
});
