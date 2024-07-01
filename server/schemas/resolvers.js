const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    // Resolver for getting a single user by ID or username
    getSingleUser: async (_, args, context) => {
      // Assuming context provides user or params
      const { user, params } = context;
      const foundUser = await User.findOne({
        $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
      });

      if (!foundUser) {
        throw AuthenticationError;
      }

      return foundUser;
    },
  },
  Mutation: {
    // Resolver for creating a user
    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });

      if (!user) {
        throw AuthenticationError;
      }

      const token = signToken(user);
      return { token, user };
    },
    // Resolver for logging in a user
    login: async (_, { username, email, password }) => {
      const user = await User.findOne({ $or: [{ username }, { email }] });

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
    saveBook: async (_, { bookDetails }, { user }) => {
      if (!user) {
        throw AuthenticationError;
        ('You need to be logged in!');
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: bookDetails } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        console.error(err);
        throw AuthenticationError;
      }
    },
    // Resolver for removing a book from a user's savedBooks
    removeBook: async (_, { bookId }, { user }) => {
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