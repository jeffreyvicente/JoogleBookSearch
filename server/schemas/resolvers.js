// File should be like user-controller.js

//Imports the user model
const {AuthenticationError} = require ('apollo-server-express');
const {User} = require('../models');

// Imports sign tocken function from auth
const {signToken} =  require('../utils/auth');

const resolvers = {
    Query: {
        //returns if the user name exist. 
        user: async (parent, {username}) => {
            return User.findOne({username});
        },

        //finds a user by the ID. 
        userId: async (parent, {_id}) => {
            return User.findOne({_id});
        } 

    },

    Mutation: {
        addUser: async (parent,{username, email, password}) => {
            const user = await User.create(username, email, password);
            const token = signToken(user);
            return {token, user};
        },

        login: async (parent, {body}) => {
            const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });
            
            if (!user) {
                throw new AuthenticationError("No user found with this email address")
            }

            const correctPW = await user.isCorrectPassword(body.password);
            if (!correctPW){
                throw new AuthenticationError("Incorrect credentials");
            }

            const token = signToken(user);

            return {token, user};
        },

           // By adding context to our query, we can retrieve the logged in user without specifically searching for them

        savebook: async (parent, args, context) => {
            console.log(context);
            if(context.user){
                const updatedUser = await User.findOneAndUpdate(
                  {_id: user._id},
                  {$addToSet: {savedBooks: args.input}},
                  {new: true, runValidators: true}
                );

                return updatedUser;
            }
            throw new AuthenticationError("You need to be logged in");
        },

        deleteBook: async(parent, args, context) => {
            if(context.user){
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: {savebook: {bookId: args.bookId}}},
                );
            }
            
        }
    },  
};