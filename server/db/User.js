const Sequelize = require('sequelize');
const db = require('./db');

const User = db.define('user', {
  // Add your Sequelize fields here
  name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  userType: {
    type: Sequelize.ENUM('STUDENT', 'TEACHER'),
    defaultValue: 'STUDENT',
    allowNull: false,
  },
  isStudent: {
    type: Sequelize.VIRTUAL,
    get() {
      return this.userType === 'STUDENT' ? true : false;
    }
  },
  isTeacher: {
    type: Sequelize.VIRTUAL,
    get() {
      return this.userType === 'TEACHER' ? true : false;
    }
  }
});

User.findUnassignedStudents = async () => {
  return await User.findAll({
    where: {
      userType: {
        [Sequelize.Op.eq]: 'STUDENT'
      },
      mentorId: {
        [Sequelize.Op.is]: null
      },
    }
  });
};

User.findTeachersAndMentees = async () => {
  return await User.findAll({
    include: { model: User, as: 'mentees'},
    where: {
      userType: {
        [Sequelize.Op.eq]: 'TEACHER'
      }
    }
  })
};

User.beforeUpdate(async (user, options) => {
  if(options.fields.includes('mentorId')) {
    const mentor = await User.findOne({
      where: {
          id: user.mentorId
      }
    });

    if(!mentor.isTeacher) {
      throw new Error("We shouldn't be able to update JERRY with FREDDY as a mentor, because FREDDY is not a TEACHER ");
    }
  };

  if(options.fields.includes('userType')) {
    const mentors = await User.findTeachersAndMentees()
    const mentees = mentors.flatMap(mentor => mentor._previousDataValues.mentees)
    if(mentees.length > 0) {
      throw new Error("We shouldn't be able to update FREDDY to a STUDENT, because JERRY is their mentee");
    }
  }

});

/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

module.exports = User;
