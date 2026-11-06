const express = require('express');
const google = require('googlethis');
const axios = require('axios');
const { htmlToText } = require('html-to-text');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: '請提供搜尋關鍵字' });

    try {
        const options = { page: 0, safe: false, additional_params: { hl: 'zh-TW' } };
        const response = await google.search(query, options);
        
        const results = response.results.map(item => ({
            title: item.title,
            description: item.description,
            url: item.url
        }));
        res.json({ keyword: query, results: results });
    } catch (error) {
        res.status(500).json({ error: '搜尋錯誤' });
    }
});

app.get('/fetch-text', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: '請提供網址' });

    try {
        const response = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        const text = htmlToText(response.data, {
            wordwrap: 130, ignoreHref: true, ignoreImage: true,
            selectors: [
                { selector: 'script', format: 'skip' },
                { selector: 'style', format: 'skip' },
                { selector: 'nav', format: 'skip' },
                { selector: 'footer', format: 'skip' }
            ]
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(text);
    } catch (error) {
        res.status(500).json({ error: '無法讀取該網頁' });
    }
});

app.listen(PORT, () => console.log(`伺服器已啟動，執行於 Port: ${PORT}`));
