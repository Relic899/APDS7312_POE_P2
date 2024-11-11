import validator from 'validator';
//Need "npm install validator" for validator to work and replace sql

const inputValidationCustomerAccount = (fieldsToValidate) => {
    return (req, res, next) => {
        const usernamePattern = /^[a-zA-Z][a-zA-Z0-9_]{6,29}$/; // Updated username pattern for only characters , _ and min number of 6 and max of 29 characters
        // Updated password pattern removed '*' from the special characters list, min char length 9 and max 30 , 
        // must have a lower case and uppercase letter and atleast 1 number and 1 special character
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&])[a-zA-Z0-9!@#$%^&]{9,30}$/;
        //fullname pattern can only contain characters and spaces 
        const fullNamePattern = /^[A-Za-z\s]+$/ ;
        // identification number pattern , must be 13 digits long and only numbers
        const idNumberPattern = /^\d{13}$/;
        // bank account number pattern , must be 10 numbers only
        const accountNumberPattern = /^\d{10}$/;

        

        // Sanitize inputs
        let { c_fullName, c_idNumber , c_accountNumber, username, password } = req.body;

        console.log("Request Body:", req.body);

        console.log("Pre trim: " + c_fullName);
        console.log("Pre trim: " + c_idNumber);
        console.log("Pre trim: " + c_accountNumber);
        console.log("Pre trim: " + username);
        console.log("Pre trim: " + password);

            // Trim whitespace
            if (fieldsToValidate.includes('c_fullName')) c_fullName = c_fullName?.trim(); 
            if (fieldsToValidate.includes('c_idNumber')) c_idNumber = c_idNumber?.trim() ;
            if (fieldsToValidate.includes('c_accountNumber')) c_accountNumber = c_accountNumber?.trim();
            if (fieldsToValidate.includes('username')) username = username?.trim();
            if (fieldsToValidate.includes('password')) password = password?.trim();
            
        // Validate 'username'
        if (fieldsToValidate.includes('username') )
        {
            // Allow specific special characters and remove others
            //const allowedSpecialChars = /[!@#$%^&]/g;
            const sanitizedName = validator.escape(username);
                    //Test for Output of Sanatized Data
                    console.log("Sanitized Name:", sanitizedName);
            if( !usernamePattern.test(sanitizedName)) 
                {
                    return res.status(400).json({ message: "Invalid username format. Username must be 7-30 characters long, start with a letter, and only contain alphanumeric characters and underscores." });
                }
                    // Update the request body with sanitized values
                    req.body.username = sanitizedName;
        }

        // Validate 'password'
        if (fieldsToValidate.includes('password') )
            {
                // Allow specific special characters and remove others
                const sanitizedPassword = password.replace(/[^a-zA-Z0-9!@#$%^&]/g, ''); // Remove unwanted characters, !,@,#,$,%,^,& are the only ones allowed
                        //Test for Output of Sanatized Data
                        console.log("Sanitized Password:", sanitizedPassword);
                if(!passwordPattern.test(sanitizedPassword))
                {

                    return res.status(400).json({ message: "Password must be at least 9 characters long and contain an uppercase letter, a lowercase letter, a number, and a special character." });
                }
                    // Update the request body with sanitized values
                    req.body.password = sanitizedPassword;
            }  
            
            
           

        // Validate 'full name'
        if (fieldsToValidate.includes('c_fullName') && !fullNamePattern.test(c_fullName)) {
            return res.status(400).json({ message: "Invalid fullname format. Full Name can only contain letters and spaces." });
        }

        // Validate 'id Number'
        if (fieldsToValidate.includes('c_idNumber') && !idNumberPattern.test(c_idNumber)) {
            return res.status(400).json({ message: "Invalid Identification Number. Identification number, must be 13 digits long and only numbers." });
        }

        // Validate 'account number'
        if (fieldsToValidate.includes('c_accountNumber') && !accountNumberPattern.test(c_accountNumber)) {
            return res.status(400).json({ message: "Invalid Bank account number , bank account number must be only 10 numbers in length and only numbers can be used. " });
    }   
        next();
    }
};

export default inputValidationCustomerAccount;

