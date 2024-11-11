import validator from 'validator';
//Need "npm install validator" for validator to work and replace sql

const inputValidationCustomerPayment = (req, res, next) => {


    //General Purpose Validation Regex:
    //OnlyNumbers pattern can only contain numbers
    const onlyNumbersPattern = /^[0-9]+$/;
    //fullName pattern can only contain capital letters , lower case letters, apostrophe and spaces 
    const fullNamePattern = /^[A-Za-z\s'-]+$/;
    const cityAndCountryPattern = /^[A-Za-z\s'-.]+$/; //Allows for only Capitals and lower case letters , apostrophes , hyphen and full stops
    const addressPattern = /^\d+\s[A-Za-z0-9\s.,'-]+$/; //Allows for numbers , capitals and lower case letters and full stops , commas and apostrophes and hyphens
    const swiftCodePattern = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/; 
    //Swift composes of the following pattern needs:
    //[A-Z]{4}: Matches the first four characters, which must be uppercase letters representing the bank code.
    //[A-Z]{2}: Matches the next two characters, which must be uppercase letters representing the country code.
    //([A-Z0-9]{2})?: Optionally matches two characters that can be uppercase letters or digits (representing the location code).
    //([A-Z0-9]{3})?$: Optionally matches three characters that can be uppercase letters or digits (representing the branch code).
    const internationalBankNoPattern = /^[A-Za-z]{2}\d{2}[A-Z0-9]{1,30}$/; //First 2 letters must be upper or lower case letters and then numbers afterwards to a max of 30 characters
    const currencyAmountPattern = /^[1-9]\d{0,2}(,\d{3})*(\.\d{2})?$/; //Allows for formats of numbers such as 1,000.00 or 10000.00 or 100,00
    const currencyAbbreviationPattern = /^[A-Z]{3}$/; //Allows for formats of 3 letter currency abbreviations such as ZAR or USD with all caps only
    const paymentReferencePattern = /^[A-Za-z0-9\s-]{1,20}$/; //Allows for formats of numbers , captial and lower case letters and dashes

    // Sanitize inputs
    let { cp_recipientFullName,  cp_recipientAddress,cp_recipientCity,cp_recipientPostalCode,cp_recipientCountry,
         cp_swiftBankName,cp_swiftCode,cp_swiftIntBankNumber, cp_amount, cp_currency, cp_payReference} = req.body;
    console.log("Pre trim: " + cp_recipientFullName);
    console.log("Pre trim: " + cp_recipientAddress);
    console.log("Pre trim: " + cp_recipientCity);
    console.log("Pre trim: " + cp_recipientPostalCode);
    console.log("Pre trim: " + cp_recipientCountry);
    console.log("Pre trim: " + cp_swiftBankName);
    console.log("Pre trim: " + cp_swiftCode);
    console.log("Pre trim: " + cp_swiftIntBankNumber);
    console.log("Pre trim: " + cp_amount);
    console.log("Pre trim: " + cp_currency);
    console.log("Pre trim: " + cp_payReference);

    // Trim whitespace
    cp_recipientFullName = cp_recipientFullName.trim();
    cp_recipientAddress = cp_recipientAddress.trim();
    cp_recipientCity = cp_recipientCity.trim();
    cp_recipientPostalCode = cp_recipientPostalCode.trim();
    cp_recipientCountry = cp_recipientCountry.trim();
    cp_swiftBankName = cp_swiftBankName.trim();
    cp_swiftCode = cp_swiftCode.trim();
    cp_swiftIntBankNumber = cp_swiftIntBankNumber.trim();
    cp_amount = cp_amount.trim();
    cp_currency = cp_currency.trim();
    cp_payReference = cp_payReference.trim();

    //After trim but before sanitization
    console.log("Data below is after trim but before Sanitization");
    console.log("After trim: " + cp_recipientFullName);
    console.log("After trim: " + cp_recipientAddress);
    console.log("After trim: " + cp_recipientCity);
    console.log("After trim: " + cp_recipientPostalCode);
    console.log("After trim: " + cp_recipientCountry);
    console.log("After trim: " + cp_swiftBankName);
    console.log("After trim: " + cp_swiftCode);
    console.log("After trim: " + cp_swiftIntBankNumber);
    console.log("After trim: " + cp_amount);
    console.log("After trim: " + cp_currency);
    console.log("After trim: " + cp_payReference);


    // Allow specific special characters and remove others ( will remove characters < , > and &)
    //const allowedSpecialChars = /[!@#$%^&]/g;
    const sanitizedFullName = validator.escape(cp_recipientFullName);
    const sanitizedAddress = validator.escape(cp_recipientAddress);
    const sanitizedCity = validator.escape(cp_recipientCity);
    const sanitizedPostalCode = cp_recipientPostalCode.replace(/[^0-9]/g, '');
    const sanitizedCountry = validator.escape(cp_recipientCountry);
    const sanitizedSwiftBankName = validator.escape(cp_swiftBankName);
    const sanitizedSwiftCode = cp_swiftCode.replace(/[^A-Z0-9]/g, '');
    const sanitizedswiftIntBankNumber = cp_swiftIntBankNumber.replace(/[^A-Z0-9]/g, ''); // Remove non-alphanumeric characters (including spaces)
    const sanitizedAmount = cp_amount.replace(/[^0-9.,]/g, '');
    const sanitizedCurrency = validator.escape(cp_currency);
    const sanitizedPaymentReference = validator.escape(cp_payReference);

    //After Sanitization Console check:
    console.log("After Sanitization has occured:")
    console.log("After San: " + cp_recipientFullName);
    console.log("After San: " + cp_recipientAddress);
    console.log("After San: " + cp_recipientCity);
    console.log("After San: " + cp_recipientPostalCode);
    console.log("After San: " + cp_recipientCountry);
    console.log("After San: " + cp_swiftBankName);
    console.log("After San: " + cp_swiftCode);
    console.log("After San: " + cp_swiftIntBankNumber);
    console.log("After San: " + cp_amount);
    console.log("After San: " + cp_currency);
    console.log("After San: " + cp_payReference);


    //Validation Methods:

        // Validate 'FullName'
        if (!fullNamePattern.test(sanitizedFullName)) {
            return res.status(400).json({ message: "Invalid Recipient Full Name Format: The name can only contain alphanumeric characters and underscores." });
        }

        // Validate 'Address'
        if (!addressPattern.test(sanitizedAddress)) {
            return res.status(400).json({ message: "Invalid Recipient Address Format: Allows for numbers , capitals and lower case letters and full stops , commas and apostrophes and hyphens" });
        }

        // Validate 'City'
        if (!cityAndCountryPattern.test(sanitizedCity)) {
            return res.status(400).json({ message: "Invalid Recipient City Format: Allows for only Capitals and lower case letters , apostrophes , hyphen and full stops" });
        }

        // Validate 'Postal Code'
        if (!onlyNumbersPattern.test(sanitizedPostalCode)) {
            return res.status(400).json({ message: "Invalid Recipient Postal Code Format: Postal Code can only contain numbers" });
        }

        // Validate 'Country'
        if (!cityAndCountryPattern.test(sanitizedCountry)) {
            return res.status(400).json({ message: "Invalid Recipient Country Format: Allows for only Capitals and lower case letters , apostrophes , hyphen and full stops" });
        }

        // Validate 'Swift Bank Name'
        if (!cityAndCountryPattern.test(sanitizedSwiftBankName)) {
            return res.status(400).json({ message: "Invalid Swift Bank Name Format: Allows for numbers , capitals and lower case letters and full stops , commas and apostrophes and hyphens" });
        }

        // Validate 'Swift Bank/BIC Code'
        if (!swiftCodePattern.test(sanitizedSwiftCode)) {
            return res.status(400).json({ message: "Invalid Swift Code Format: The first four characters, which must be uppercase letters representing the bank code."
               + "\n The next two characters, which must be uppercase letters representing the country code. "
               + "\n Optionally matches two characters that can be uppercase letters or digits (representing the location code). "
               + "\n Optionally matches three characters that can be uppercase letters or digits (representing the branch code)." 
               + "\n Example: AAAA-BB-CC-123"});

        }

         // Validate 'IBAN or International Bank Account Number'
        if (!internationalBankNoPattern.test(sanitizedswiftIntBankNumber)) {
            return res.status(400).json({ message: "Invalid Swift International Bank Account Number Format: First 2 letters must be upper or lower case letters and then numbers afterwards to a max of 30 characters"  
                + "\n Example: FR76XYZ123456"});
        }

        // Validate 'Currency'
        if (!currencyAbbreviationPattern.test(sanitizedCurrency)) {
            return res.status(400).json({ message: "Invalid Currency Abreviation Format: Allows for formats of 3 letter currency abbreviations such as ZAR or USD with all caps only" });
        }

        // Validate 'Amount'
        if (!currencyAmountPattern.test(sanitizedAmount)) {
            return res.status(400).json({ message: "Invalid Currency Amount Format: Allows for formats of numbers such as 1,000.00 or 10000.00 or 100,00 with commas and fullstops" });
        }

        // Validate 'Payment Reference'
        if (!paymentReferencePattern.test(sanitizedPaymentReference)) {
            return res.status(400).json({ message: "Invalid Payment Reference Format: It only Allows for formats of numbers , captial and lower case letters and dashes at a maximum length of 20 characters" });
        }

    next();
};

export default inputValidationCustomerPayment;