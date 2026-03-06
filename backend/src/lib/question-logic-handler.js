class QuestionLogicHandler {
    // this maps operator codes to their "evaluation functions"
    #operators = {
        'eq': (a, b) => a === b, // equals
        'neq': (a, b) => a !== b, // not equals
        'gt': (a, b) => a > b, // greater than
        'gte': (a, b) => a >= b, // greater than or equal to
        'lt': (a, b) => a < b, // less than
        'lte': (a, b) => a <= b, // less than or equal to
        'in': (a, b) => Array.isArray(b) && b.includes(a), // is in array of values
        'nin': (a, b) => Array.isArray(b) && !b.includes(a), // is not in array of values
    };

    /**
     * takes in a two values and an operator and returns a boolean of the parameters' evaluation | 
     * convention is to put userVal first, then operator, then rightVal last
     * @param {*} userVal - the answer a user gave when answering a question
     * @param {*} opCode - operator code specifying operator to use to evaluation
     * @param {*} rightVal - the value the user's answer will be compared against
     * @returns 
     */
    evaluate(userVal, opCode, rightVal) {
        const fn = this.#operators[opCode];
        if (!fn) throw new Error(`Unsupported operator: ${opCode}`);
        return fn(leftVal, rightVal);
    }
}

// export a single instance of QuestionLogicHandler since we don't really need different instances of it
const questionLogicHandler = new QuestionLogicHandler();
module.exports = questionLogicHandler
