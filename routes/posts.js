const express = require('express');
const router = express.Router();
// could use one line instead: const router = require('express').Router();
const client = require('../db');
const postList = require('../views/postList');
const postDetails = require('../views/postDetails');
const addPost = require('../views/addPost');

const sql =
  // 'SELECT posts.*, counting.upvotes, name FROM posts INNER JOIN (SELECT postId, COUNT(*) as upvotes FROM upvotes GROUP BY postId) AS counting ON posts.id = counting.postId';
  `SELECT posts.*, users.name, upvotes.total as upvotes
  FROM posts
  JOIN users
  ON users.id = posts.userid
  LEFT OUTER JOIN (
    SELECT postid, count(*) as total
    FROM upvotes
    GROUP BY postid
  ) upvotes
  ON upvotes.postid = posts.id
`;
router.get('/', async (req, res, next) => {
  try {
    const data = await client.query(sql);
    res.send(postList(data.rows));
  } catch (ex) {
    next(ex);
  }
});

router.get('/add', (req, res, next) => {
  try {
    res.send(addPost());
  } catch (ex) {
    next(ex);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const sql2 = `SELECT posts.*, users.name, upvotes.total as upvotes
    FROM posts
    JOIN users
    ON users.id = posts.userid
    LEFT OUTER JOIN (
      SELECT postid, count(*) as total
      FROM upvotes
      GROUP BY postid
    ) upvotes
    ON upvotes.postid = posts.id
    WHERE posts.id = $1
  `;
    const post = await client.query(sql2, [req.params.id]);
    if (!post.rows.length) {
      throw new Error('User with that id does not exist');
    }
    res.send(postDetails(post.rows[0]));
  } catch (ex) {
    next(ex);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const name = req.body.name;
    const title = req.body.title;
    const content = req.body.content;

    const nameList = await client.query(
      `SELECT * FROM users WHERE name = '${name}';`
    );

    if (!nameList.rows.length) {
      console.log(nameList);
      await client.query(`INSERT INTO users (name) values ('${name}');`);
      console.log('exists');
    }
    const sqlPost = `INSERT INTO posts (userId, title, content, date) VALUES (                    (SELECT id from users where name='${name}'), '${title}',                    '${content}', (now()));`;

    await client.query(sqlPost);
    const postId = await client.query(
      `SELECT id FROM users WHERE name = '${name}';`
    );
    const id = postId.rows[0].id;
    console.log(id);
    console.log(typeof id);
    res.redirect(`/posts/${id}`); // Redirect to the post details page
  } catch (ex) {
    next(ex);
  }
});

module.exports = router;
