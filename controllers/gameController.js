const db = require('../db'); // Database connection


exports.getLeaderboard = async (req, res) => {
    const { gameId } = req.params;
    try {
      // Use db.promise().query to return a promise
      const [leaderboard] = await db.promise().query(
        'SELECT u.firstname, u.lastname, hs.highscore FROM HighScores hs INNER JOIN User u ON hs.user_id = u.user_id WHERE hs.game_id = ? ORDER BY hs.highscore DESC LIMIT 10',
        [gameId]
      );
  
      // Return the leaderboard data as JSON
      res.status(200).json(leaderboard);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch leaderboard.' });
    }
  };


exports.submitScore = async (req, res) => {
    try {
      const { userId, score, gameName } = req.body; // Assuming the request has these fields
  
      if (!userId || !score || !gameName) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Save score to the database
      const query = `
        INSERT INTO HighScores (user_id, game_id, highscore)
        VALUES (?, (SELECT game_id FROM Games WHERE game_name = ?), ?)
        ON DUPLICATE KEY UPDATE highscore = GREATEST(highscore, VALUES(highscore))
      `;
  
      await db.promise().execute(query, [userId, gameName, score]);
  
      res.status(200).json({ message: 'Score submitted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to submit score' });
    }
  };