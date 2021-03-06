/**
 * Created by Henry Huang on 2019-07-08.
 */
const express = require('express');
const router = express.Router();
const db = require('../../mongodb/db');
const logger = require('../../lib/logger');
const dateUtils = require('../../utils/dateUtils');

const Poem = db.Poem;

const buildResponseAndReturn = ({ res, data, error, module = Poem }) => {
  let code = error ? 400 : 200;
  if (error) {
    logger.error(error);
  }
  if (data && Array.isArray(data)) {
    data = data.map(d => module.toDTO(d));
  } else if (data) {
    data = module.toDTO(data);
  }
  return res.status(code).json({
    data: data || {},
    error: error ? error.message : null,
  })
};

const updatePoem = (id, updateData) => {
  return new Promise((resolve, reject) => {
    Poem.findOne({ _id: id }).exec((err, poem) => {
      if (err) {
        reject(err);
      }
      if (!poem) {
        reject(new Error('Poem does not exist!'))
      }

      if (!updateData || updateData.length <= 0) {
        // formData is empty, do nothing
        reject(new Error('No data provided. Nothing happened.'));
      }

      // Parse object from json data

      // Iterate through data
      for (let key in updateData) {
        poem[key] = updateData[key]
      }

      poem.save((err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  });
};

router.get('/', function (req, res) {

  Poem.find({}).sort({ order: 'desc' }).exec(
    function (err, poems) {
      if (err) {
        console.log(err);
        return;
      }

      const poemObjects = poems.map((poem) => {
        const t = poem.toObject();
        t['creationDate'] = dateUtils.format(poem.creationDate);
        return t;
      });

      res.render('admin/list_poems', {
        title: 'Manage Poems',
        custom_js: 'admin/list-poems.bundle',
        poems: poemObjects,
        active: { list_poems: true },
        body_scripts: 'list-poems.bundle',
      });
    });

});

router.get('/modify/:id', (req, res) => {

  const { id } = req.params;
  logger.debug(`Load view for poem update with id = ${id}`);

  Poem.findOne({ _id: id }, (err, poem) => {
    if (err) {
      return next(err);
    }
    if (!poem) {
      return next(Error(`Cannot find poem with id = ${id}`));
    }

    res.render('admin/new_poem', {
      title: 'Update poem',
      poem: Poem.toDTO(poem),
      body_scripts: 'new-poem.bundle',
      active: { list_poems: true, modify: true },
      css: ['new-poem'],
    });

  });

});

router.post('/', (req, res) => {

  const body = req.body;
  const { id } = body;

  if (id) {
    logger.debug(`update poem (id=${id}) ${JSON.stringify(body)}`);
  } else {
    logger.debug(`create poem ${JSON.stringify(body)}`);
  }

  try {
    Poem.validate(body);
  } catch (e) {
    return buildResponseAndReturn({
      res,
      error: e
    })
  }

  if (id) {
    // update

    updatePoem(id, body)
      .then(() => buildResponseAndReturn({ res }))
      .catch((error) => buildResponseAndReturn({ res, error }));

  } else {
    // create

    db.Counter.findOne({ _id: 'poem' }, (error, counter) => {

      if (error) {
        return buildResponseAndReturn({
          res,
          error
        })
      }

      // Autoincrement of id
      if (!counter) {
        counter = new db.Counter({
          _id: "poem",
          seq: 0
        });
      }
      counter.seq++;
      counter.save((err) => {

        if (err) {
          return buildResponseAndReturn({
            res,
            error: err
          })
        }

        const now = new Date();
        const poem = new Poem({
          _id: counter.seq,
          title: body.title,
          content: body.content,
          visible: body.visible,
          year: body.year || now.getFullYear(),
          author: body.author || 'yonny',
          order: now.getTime()
        });

        poem.save((err, { _doc: p }) => {
          if (err) {
            return buildResponseAndReturn({
              res,
              error: err
            })
          }
          return buildResponseAndReturn({ res, data: p });
        })
      })
    });

  }

});

router.patch('/visible', (req, res) => {
  const { id, visible } = req.body;
  updatePoem(id, { visible })
    .then(() => {
      return buildResponseAndReturn({ res })
    })
    .catch((e) => {
      return buildResponseAndReturn({ res, error: e })
    })
});

router.post('/change-order', (req, res) => {
  // TODO
});

router.get('/new', (req, res) => {
  res.render('admin/new_poem', {
    title: 'Create new poem',
    body_scripts: 'new-poem.bundle',
    active: { list_poems: true, create: true },
    css: ['new-poem'],
  });
});

router.delete('/', (req, res) => {

  const { id } = req.body;
  if (!id) {
    return buildResponseAndReturn({ res, error: Error("Missing poem id.") });
  }

  Poem.remove({ _id: id }, (err) => {
    return buildResponseAndReturn({ res, error: err });
  })

});

module.exports = router;
