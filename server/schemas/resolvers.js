const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    // Resolver for getting a single user by ID or username
    me: async (parent, args, { user }) => {
      if (user) {
        const userData
        = await User.findOne({ _id: user._id })
          .select('-__v -password')
          .populate('books');

        return userData;
      }
      throw new AuthenticationError('Not logged in');
    }
    
  },
  Mutation: {
    // Resolver for creating a user
    addUser: async ( parent, args ) => {
      const user = await User.create(args);

      if (!user) {
        throw AuthenticationError;
      }

      const token = signToken(user);
      return { token, user };
    },
    // Resolver for logging in a user
    loginUser: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { bookData }, { user }) => {
      if (!user) {
        throw AuthenticationError;
        ('You need to be logged in!');
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        console.error(err);
        throw AuthenticationError;
      }
    },
    // Resolver for removing a book from a user's savedBooks
    removeBook: async (parent, { bookId }, { user }) => {
      if (!user) {
        throw AuthenticationError;
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        if (!updatedUser) {
          throw AuthenticationError;
        }
        return updatedUser;
      } catch (err) {
        console.error(err);
        throw AuthenticationError;
      }
    },
  },
};

module.exports = resolvers;