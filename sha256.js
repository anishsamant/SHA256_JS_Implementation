const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 
    61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 
    149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 
    229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311];

const constants = []; 

function generateConstants() {
    for (let i = 0; i < 64; i++) {
        let val = Math.cbrt(primes[i]);
        val = (val - Math.floor(val)); 
        val = Math.floor(val * Math.pow(2,32));
        val = (val >>> 0).toString(2);
        constants.push(val.padStart(32, '0'));
    }
};

function myFunc() {
    let stringPlaintext, binaryPlaintext, paddedPlaintext;
    let messageBlocks = [], registers = [], hash;
    readline.question(`Enter a plaintext to hash: `, userInp => {
        stringPlaintext = userInp
        // printMessage(stringPlaintext, "Plaintext");

        binaryPlaintext = covertTextToBinary(stringPlaintext);
        // printMessage(binaryPlaintext, "Binary Plaintext");

        paddedPlaintext = padDigitsUptoMultipleOf512Minus64(binaryPlaintext);
        paddedPlaintext += padBinaryPlaintextLength(binaryPlaintext.length);
        // printMessage(paddedPlaintext, "Padded Plaintext");

        messageBlocks = createMessageBlocks(paddedPlaintext);
        // printMessage(messageBlocks, "Message Blocks");

        generateConstants();
        // printMessage(constants, "Constants");

        registers = initializeRegisters();
        // printMessage(registers, "Initial Registers");

        messageBlocks.forEach(msg => {
            let words = createMessageSchedule(msg);
            // printMessage(words, "Words");

            registers = performCompress(registers, words);
            // printMessage(registers, "New Registers");
        })

        hash = generateHash(registers);
        printMessage(hash, "Hash Generated");

        readline.close()
    })
}

// ----------------------------------Steps Performed-------------------------------

function covertTextToBinary(plaintext) {
    let binaryPlaintext = "";
    for (let i = 0; i < plaintext.length; i++) {
        binaryPlaintext += ("000000000" + plaintext[i].charCodeAt(0)
            .toString(2)).substr(-8);
    }
    return binaryPlaintext;
}

function padDigitsUptoMultipleOf512Minus64(binaryPlaintext) {
    let paddedPlaintext = binaryPlaintext;
    let bit = "1";
    while ((paddedPlaintext.length + 64) % 512 != 0) {
        paddedPlaintext += bit;
        bit = "0";
    }
    return paddedPlaintext;
}

function padBinaryPlaintextLength(binaryPlaintextLength) {
    let bitConversion = binaryPlaintextLength.toString(2);
    bitConversion = bitConversion.padStart(64, '0');
    return bitConversion;
}

function createMessageBlocks(paddedPlaintext) {
    return paddedPlaintext.match(/.{1,512}/g);
}

function initializeRegisters() {
    registers = [];
    for (let i = 0; i < 8; i++) {
        let val = Math.sqrt(primes[i]);
        val = (val - Math.floor(val)); 
        val = Math.floor(val * Math.pow(2,32));
        val = (val >>> 0).toString(2);
        registers.push(val.padStart(32, '0'));
    }
    return registers;
}

function createMessageSchedule(msg) {
    words = msg.match(/.{1,32}/g);
    for (let i = 16; i < 64; i++) {
        words.push(addBinary([op2(words[i-2]), words[i-7], op1(words[i-15]), words[i-16]]));
    }
    return words;
}

function performCompress(registers, words) {
    let t1, t2;
    let initRegisters = registers.slice();
    for (let i = 0; i < 64; i++) {
        t1 = addBinary([op4(registers[4]), 
            ch(registers[4], registers[5], registers[6]), 
            registers[7], constants[i], words[i]]);
        t2 = addBinary([op3(registers[0]), maj(registers[0], registers[1], registers[2])]);
        
        registers = registers.concat(registers.splice(0,7));
        registers.shift();
        registers.unshift(addBinary([t1, t2]));
        registers[4] = addBinary([registers[4], t1]);
    }

    for (let i = 0; i < 8; i++) {
        registers[i] = addBinary([initRegisters[i], registers[i]]);
    }
    return registers;
}

function generateHash(registers) {
    let hash = "";
    registers.forEach(reg =>  {
        let res = reg.match(/.{1,4}/g).reduce((acc, i) => {
            return acc + parseInt(i, 2).toString(16);
        }, '');
        hash += res;
    });
    return hash;
}

// ------------------------------Operations-------------------------------------------------

function op1(x) {
    return xor(rotr(x, 7), rotr(x, 18), shr(x, 3));
}

function op2(x) {
    return xor(rotr(x, 17), rotr(x, 19), shr(x, 10));
}

function op3(x) {
    return xor(rotr(x, 2), rotr(x, 13), rotr(x, 22));
}

function op4(x) {
    return xor(rotr(x, 6), rotr(x, 11), rotr(x, 25));
}

function ch(x, y, z) {
    let res = "";
    for (let i = 0; i < x.length; i++) {
        res += (x[i] == '1'? y[i] : z[i]);
    }
    return res;
}

function maj(x, y, z) {
    let res = "";
    for (let i = 0; i < x.length; i++) {
        res += (Number(x[i]) + Number(y[i]) + Number(z[i]) > 1? '1' : '0');
    }
    return res;
}

function rotr(text, noOfChars = 0) {
    let n = noOfChars % text.length;
    n = (text.length - n) % text.length;
    return text.slice(n) + text.slice(0, n);
}

function shr(text, noOfChars = 0) {
    text = text.slice(0, -noOfChars);
    return text.padStart(32, '0');
}

function xor(x, y, z) {
    let res = "";
    for (let i = 0; i < x.length; i++) {
        let val = Number(x[i]) + Number(y[i]) + Number(z[i]);
        res += (val % 2 == 0? '0' : '1');
    }
    return res;
}

function addBinary(nums) {
    let numLen = nums.length;
    let carry = 0;
    let res = "";
    for (let i = 0; i < 32; i++) {
        let val = 0;
        for (let j = 0; j < numLen; j++) {
            val += Number(nums[j][32 - 1 - i] || 0);
        }
        val += carry;
        carry = Math.floor(val / 2);
        res = (val % 2) + res;
    }
    if (carry) {
        res = 1 + res;
    }
    return res.slice(res.length - 32);
}

// ----------------------------Print To Console---------------------------------------

function printMessage(value, title) {
    console.log("\n");
    console.log(title+":");
    console.log(value);
}  

myFunc()