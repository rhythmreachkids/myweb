// 创建背景泡泡
function createBackgroundBubbles() {
    const container = document.getElementById('backgroundBubbles');
    const bubbleCount = 20;
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // 随机大小和位置
        const size = Math.random() * 120 + 30;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.top = `${Math.random() * 100}%`;
        
        // 随机动画延迟
        bubble.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(bubble);
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 创建背景泡泡
    createBackgroundBubbles();
    
    // 获取开始游戏按钮
    const startGameBtn = document.getElementById('startGameBtn');
    
    // 获取音乐选择项
    const musicItems = document.querySelectorAll('.music-item');
    let selectedSong = 'twinkle'; // 默认选择小星星
    
    // 音乐选择事件
    musicItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有active类
            musicItems.forEach(i => i.classList.remove('active'));
            // 添加active类到当前项
            this.classList.add('active');
            // 更新选择的歌曲
            selectedSong = this.getAttribute('data-song');
        });
    });
    
    // 开始游戏按钮点击事件
    startGameBtn.addEventListener('click', function() {
        // 存储选择的歌曲到sessionStorage
        sessionStorage.setItem('selectedSong', selectedSong);
        
        // 跳转到游戏页面
        window.location.href = 'game.html';
    });
    
    // 添加悬停效果
    musicItems.forEach(item => {
        item.addEventListener('mouseover', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = '0 5px 15px rgba(255, 255, 255, 0.2)';
            }
        });
        
        item.addEventListener('mouseout', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            }
        });
    });
});