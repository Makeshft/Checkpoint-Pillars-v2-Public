const router = require('express').Router();
const {
  models: { User },
} = require('../db');

/**
 * All of the routes in this are mounted on /api/users
 * For instance:
 *
 * router.get('/hello', () => {...})
 *
 * would be accessible on the browser at http://localhost:3000/api/users/hello
 *
 * These route tests depend on the User Sequelize Model tests. However, it is
 * possible to pass the bulk of these tests after having properly configured
 * the User model's name and userType fields.
 */

// Add your routes here:

router.get('/unassigned',async (req, res, next) => {
  try {
    const unassigned = await User.findUnassignedStudents();
    res.status(200).send(unassigned)
  } catch (e) {
    next(e)
  }
});

router.get('/teachers', async (req, res, next) => {
  try {
    const teachers = await User.findTeachersAndMentees();
    res.status(200).send(teachers)
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;

    if(isNaN(id)) {
      res.sendStatus(400);
    } else {
      const user = await User.findOne({
        where: {
          id: id
        }
      });

      if(user instanceof User) {
        await User.destroy({
          where: {
            id: id
          }
        });
        res.status(204).send();
      };
    };

    res.status(404).send();
  } catch (e) {
    next(e)
  };
});

router.post('/', async (req, res, next) => {
  try {
    const [name, isCreated] = await User.findOrCreate({
      where: {
        name: req.body.name
      }
    });

    if(isCreated) {
      res.status(201).send(name);
    } else {
      res.sendStatus(409);
    };

  } catch (e) {
    next(e)
  };
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;

    const rowsUpdated = await User.update(
      {
        name: req.body.name,
        userType: req.body.userType
      },
      {
        where: {
          id: id
        }
      }
    );

    if(rowsUpdated > 0) {
      const user = await User.findOne({
        where: {
          id: id
        }
      });
      res.status(200).send(user);
    } else {
      res.sendStatus(404);
    }

  } catch (e) {
    next(e);
  }
})

router.use('/', (err, req, res, next) => {
  // console.error(err.stack);
  res.sendStatus(500);
});

module.exports = router;
