import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const basePromptPrefix =
    `
Given the the name of college major, please generate a sentence for each of the following: 
1. An overview of the major
2. Typical courses that a student would take when studying this major in college
3. Common career paths for students who study this major.
4. Related majors that one might be interested in.

College Major:
`

const generateAction = async (req, res) => {
    console.log(`API: ${basePromptPrefix}${req.body.userInput}`)

    const baseCompletion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `${basePromptPrefix}${req.body.userInput}`,
        temperature: 0.8,
        max_tokens: 250,
    });

    const basePromptOutput = baseCompletion.data.choices.pop();

    const secondPrompt =
        `
    The input is a list of information related to a college major. Take the information and first reformat it. Then for each bullet, expand on it and write a few more sentences. Please only add information you are sure to be accurate. The output should have four headings: Overview, Courses, Career Paths, and Related Majors. Each should have a short paragraph below. 

    Example Input: 
    1. An overview of the major: Bioengineering is a field of study that combines engineering principles with biological and medical sciences to create solutions for medical, agricultural, and environmental problems.

    2. Typical courses that a student would take when studying this major in college: Common courses in bioengineering include anatomy, physiology, molecular biology, biochemistry, genetics, bioinformatics, and engineering design.

    3. Common career paths for students who study this major: Common career paths for bioengineering students include biomedical engineer, genetic engineer, biotechnologist, and medical research scientist.

    4. Related majors that one might be interested in: Related majors that may be of interest to those studying bioengineering include biochemistry, chemical engineering, biomedical engineering, and molecular biology.

    Example Output: 
    Overview
    It involves the application of engineering principles to the design of biological systems, such as medical devices, diagnostic tools, and agricultural systems. It also involves the application of engineering techniques to the study of biological systems and processes, such as genetic engineering, tissue engineering, and medical imaging. Bioengineering has been used to develop medical treatments and technologies, such as prosthetics and artificial organs, as well as to develop diagnostics and treatments for diseases such as cancer and HIV/AIDS. It has also been used to develop agricultural systems, such as genetically modified crops and precision farming. Bioengineering has also been used to develop environmental technologies and solutions, such as water purification systems and green energy technologies. Bioengineers are involved in research and development, as well as the design and testing of products, and are often employed in the medical and agricultural industries.

    Courses
    Common courses in bioengineering include anatomy, physiology, molecular biology, biochemistry, genetics, bioinformatics, and engineering design. Additional courses may include medical imaging, tissue engineering, cell biology, immunology, biomechanics, artificial organs, drug delivery systems, radiation therapy, and biomaterials science.

    Career Paths
    Common career paths for bioengineering students include biomedical engineer, genetic engineer, biotechnologist, and medical research scientist. These professionals use their knowledge of engineering, biology, and biochemistry to develop solutions to medical and healthcare problems. They may work in research and development, clinical trials, product design, and manufacturing. Additionally, they may work in laboratory settings and use their skills to design and develop medical devices, such as prosthetics, implants, and diagnostic equipment. They may also be involved in medical research, including the development of new treatments for diseases.

    Related Majors
    Related majors that may be of interest to those studying bioengineering include biochemistry, chemical engineering, biomedical engineering, and molecular biology. Other related majors include genetics, microbiology, bioinformatics, biophysics, neuroscience, and mechanical engineering.

    Input:
    ${basePromptOutput.text}


    Output:
    `

    const secondPromptCompletion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `${secondPrompt}`,
        // I set a higher temperature for this one. Up to you!
        temperature: 0.75,
        // I also increase max_tokens.
        max_tokens: 500,
    });
    // Get the output
    const secondPromptOutput = secondPromptCompletion.data.choices.pop();

    // Send over the Prompt #2's output to our UI instead of Prompt #1's.
    res.status(200).json({ output: secondPromptOutput });
};

export default generateAction;