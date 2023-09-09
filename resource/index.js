const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.get('/resource', async (req, res) => {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const response = await fetch('http://localhost:3000/token', {
    method: 'POST',
    headers: {
      Authorization: accessToken.split(" ")[1],
    },
  });

  if (response.status !== 200) {
    console.log(response);
    if(response.body.error==="TokenExpiredError: jwt expired"){
        return res.status(401).json({ error: 'Token Expired' });
    }
    return res.status(401).json({ error: 'Token Invalid' });
  }

  const decodedToken = jwt.decode(accessToken.split(" ")[1]);
  const roles = decodedToken.roles;

  console.log(roles);
  
  if (roles.includes('admin')) {
    res.json({ resource: 'Admin resource data' });
  } else {
    res.json({ resource: 'User resource data' });
  }
  
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});