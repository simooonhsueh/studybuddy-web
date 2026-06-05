const fs = require('fs');
const path = require('path');

const getMatches = (req, res) => {
    const filePath = path.join(__dirname, '../data/matches.json');
    const matchData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.status(200).json({ status: 'success', data: matchData.matches });
};

module.exports = { getMatches };