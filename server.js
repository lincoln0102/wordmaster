const express = require('express');
const app = express();
const port = 3000;

app.use(express.static(__dirname));

app.listen(port, () => {
    console.log(`游戏服务器运行在 http://localhost:${port}`);
});