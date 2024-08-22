const { db, Table,expensesTable } = require('../DataBase/db.config.js');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()
const bcrypt = require('bcrypt');

//Signup
const signup = async (userData = {}) => {
    const { username, user_email_id, password } = userData;

    // First, check if the username or email already exists
    const getUserParams = {
        TableName: Table,
        FilterExpression: 'username = :username OR user_email_id = :user_email_id',
        ExpressionAttributeValues: {
            ':username': username,
            ':user_email_id': user_email_id
        }
    };
    try {
        // Scan the table to check if the username or email exists
        const existingUsers = await db.scan(getUserParams).promise();

        if (existingUsers.Items.length > 0) {
            // If a user with the same username or email exists, return an error
            return { success: false, message: 'Username or Email already exists' };
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user object with the hashed password
        const newUser = {
            username,
            user_email_id,
            password: hashedPassword  // Store hashed password
        };

        const putUserParams = {
            TableName: Table,
            Item: newUser  // Register the new user
        };

        // Save the new user to DynamoDB
        await db.put(putUserParams).promise();

        return { success: true, message: 'User registered successfully' };

    } catch (error) {
        console.error('Error during registration:', error);
        return { success: false, message: 'Error during user registration' };
    }
};




//Login
const Login = async (credential = {}) => {
    const { user_email_id, password } = credential;

    const getUserParams = {
        TableName: Table,
        KeyConditionExpression: 'user_email_id = :user_email_id',
        ExpressionAttributeValues: {
            ':user_email_id': user_email_id
        }
    };


    try {
        const result = await db.query(getUserParams).promise();
        const user = result.Items[0];
        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }

        const passmatch = await bcrypt.compare(password, user.password);

        if (passmatch) {
            const token = jwt.sign(
                { email: user.email, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '1h' } 
            );

            return { success: true, message: 'Login successful', token };
        } else {
            // Passwords do not match
            return { success: false, message: 'Invalid email or password' };
        }

    } catch (error) {
        console.error('Error during login:', error);
        return { success: false, message: 'Error during login' };
    }
};

const currentDate = new Date().toISOString(); 

//Create expenses

const createexpenses=async(expensesdata={})=>{

    const { item_id, itemName, amount,date,category} = expensesdata;

    const params = {
        TableName: expensesTable,
        Item: {
          item_id: Number(item_id),
          itemName: itemName,
          amount: amount,
          date: currentDate,
          category: category,
        },
      };
    
      try {
        await db.put(params).promise();
        return { success: true, message: 'Expenses created ',expensesdata};
      } catch (error) {
        console.error('Error creating expense:', error);
        return { success: false, message: 'Error during creating expenses' };
      }
    };



// Read all expenses
const readAllexpenses = async () => {
    const params = {
        TableName: expensesTable
    }

    try {
        const { Items = [] } = await db.scan(params).promise()
        return { success: true, data: Items }

    } catch (error) {
        return { success: false, data: null }
    }

}


// Delete expenses
const deleteexpenses = async (value, key = 'item_id') => {
    
    const params = {
        TableName: expensesTable,
        Key: {
            [key]: parseInt(value)
        }
    }

    try {
        await db.delete(params).promise()
        return { success: true }

    } catch (error) {
        return { success: false }
    }
}




//Update expenses

const Updateexpenses = async (data = {}, key = 'item_id') => {
    
    if (!data[key]) {
        throw new Error(`Missing required key: ${key}`);
    }
    data[key] = parseInt(data[key]);
    const params = {
        TableName: expensesTable,
        Item: data
    };

    try {
        await db.put(params).promise();
        return { success: true };
    } catch (error) {
        console.error('Error creating or updating item:', error);
        return { success: false, error: error.message };
    }
};



module.exports = {
    signup,
    Login,
    createexpenses,
    readAllexpenses,
    deleteexpenses,
    Updateexpenses

    
};
