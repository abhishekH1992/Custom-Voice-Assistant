const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const userResolver = {
    Query: {
        me: async (_, __, { user }) => {
            // if (!user) {
            //     console.log('No user in context, throwing error');
            //     throw new Error('Not authenticated');
            // }
            // return user;
            return {
                email: "abhishek@test.com",
                firstName: "Test",
                id: "1",
                lastName: "Test"
            }
        },
    },
    Mutation: {
        register: async (_, { firstName, lastName, email, password }) => {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                throw new Error(JSON.stringify({
                    code: 'BAD_USER_INPUT',
                    errors: {
                        email: 'User is already registered'
                    }
                }));
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ firstName, lastName, email, password: hashedPassword });
        
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
            return { token, user };
        },
        login: async (_, { email, password }) => {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw new Error(JSON.stringify({
                    code: 'BAD_USER_INPUT',
                    errors: {
                        general: 'Invalid credentials'
                    }
                }));
            }
    
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                throw new Error(JSON.stringify({
                    code: 'BAD_USER_INPUT',
                    errors: {
                        general: 'Invalid credentials'
                    }
                }));
            }
        
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
            return { token, user };
        },
    },
}

module.exports = userResolver;