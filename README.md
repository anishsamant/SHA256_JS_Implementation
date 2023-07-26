# SHA256_JS_Implementation
### The SHA256 cryptographic hash function has following main properties:
1.	<b>Deterministic:</b> The same message will always result in the same hash value.
    * All the operations in the above hash function are deterministic and there is no randomness involved anywhere, hence ensuring that for a given input, the same output will be generated every time.

2.	<b>Collision resistant:</b> It is computationally infeasible to find two different messages with the same hash value.
    * Because the hash is 256 binary bits long, there are 2256 output possibilities.
    * Hence the probability of two messages colliding to a single hash is 1/2256, which is very low. 
    * This property makes it computationally infeasible to find a collision between two different messages, hence being collision resistant.

3.	<b>Fixed output size:</b> For any arbitrary size input, the output is of fix size.
    * The output is fixed to be 256 bits long, no matter what the size of the input is.
    * 8 32-bit registers are initialized and updated throughout the computation of the hash and finally each register result is converted to hex format and concatenated to get the final hash.

### Algorithm:
1.	<b>Initialization:</b>
    1.	Initialize 8 registers a-h.
        -	Take square root of first 8 prime numbers.
        -	Take fractional part and multiply by 2^32.
        -	convert to binary.
    2.	Generate constants constants[0…63].
        -	Take Cube root of first 64 prime numbers.
        -	Take fractional part and multiply by 2^32.
        -	convert to binary.

2.	<b>Message conversion to binary:</b>
    1.	Convert input plaintext to binary plaintext. (Each character with 8-bit binary representation)

3.	<b>Perform Padding:</b>
    1.	Convert binary plaintext to a length that is a multiple of 448 bits by padding one 1 bit followed by required number of 0 bits.
    2.	Further add the 64-bit representation of the length of the binary plaintext to make the message multiple of 512 bits long.

4.	<b>Create Message Blocks:</b>
    1.	Convert message to blocks of 512 bits each.

5.	<b>Create Message Schedule (For each Message Block):</b>
    1.	First create 16 32-bit words.
    2.	Then create another 48 32-bit words by performing the following operation.
        -	word[i] = op2(word[i-2]) + word[i-7] + op1(word[i-15]) + word[i-16] </br>
        where: </br>
        op1(x) = rotr(x,7) XOR rotr(x,18) XOR shr(x,3) </br>
        op2(x) = rotr(x,17) XOR rotr(x,19) XOR shr(x,10) </br>
        rotr(x,n) => rotate right binary x by n places </br>
        shr(x,n) => shift right binary x by n places </br>

6.	<b>Perform Compression (For each Message Block):</b>
    1.	Take the 8 state registers a-h.
    2.	Repeat for all words in message schedule, i.e. 64 times
        1.	Create two temporary words:
            -	T1 = op4(e) + ch(e,f,g) + h + Ki + Wi
            -	T2 = op3(a) + maj(a,b,c) </br>
            where: </br>
            op3(x) = rotr(x,2) XOR rotr(x,13) XOR rotr(x,22) </br>
            op4(x) = rotr(x,6) XOR rotr(x,11) XOR rotr(x,25) </br>
            ch(x, y, z) => (if xi = 1 chooses yi else chooses zi) </br>
            maj(x,y,z) => (chooses majority bit between xi, yi and zi) </br>
            Wi => word[i], created in previous step
            Ki => constant[i], generated initially
        2.	Steps: 
            -	Move state registers down by 1 position (b=a, c=b, d=c, e=d, f=e, g=f, h=g)
            -	a = T1 + T2
            -	e = e + T1
    3.	Add the initial hash values from 6.i to final results for a-h from step 6.b.
    4.	6.iii becomes initial hash values for a-h for the next message block.

7.	<b>Generate Final Hash:</b>
    1.	Convert each of a-h 32-bit binary to hex.
    2.	Join all 8 hex to get final hash value.
  
### Results:
A single change in alphabet from lower case to upper case completely changes the hash. </br> </br>
![image](https://github.com/anishsamant/SHA256_JS_Implementation/assets/21247634/75b57b20-6e7a-42bb-bec7-036f04b2b90e)

