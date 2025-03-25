const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

function generateIcon(size) {
    canvas.width = size;
    canvas.height = size;
    
    // 背景
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(0, 0, size, size);
    
    // 文字
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size/2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('词', size/2, size/2);
    
    return canvas.toDataURL('image/png');
}

// 生成两种尺寸的图标
const icon192 = generateIcon(192);
const icon512 = generateIcon(512);

// 下载图标
function downloadIcon(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
}

downloadIcon(icon192, 'icon-192.png');
downloadIcon(icon512, 'icon-512.png');