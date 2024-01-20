/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
// Hooks
import { useLayoutEffect } from "react";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import IconButton from '@mui/material/IconButton';
const App = () => {

  return (
    <div className="max-w-[100vw] m-[auto]">
      <div className="h-[calc(100vh-64px)]">
        <div className="presentation-slide relative bg-white rounded-lg overflow-hidden h-full">
          <img src="./assets/arXtect.png" alt="arXtect: Shape the Future of Scholarly Publishing" className="w-full h-full" />
          <div className="absolute bottom-5 w-full left-0 text-center">
            <h1 className="text-4xl font-bold  text-white">arXtect: Shape the Future of Scholarly Publishing</h1>
          </div>
        </div>
      </div>
      {/* Introduction */}
      <div className="bg-white p-8">
        <h1 className="text-4xl font-bold py-8">Introduction</h1>
        <div className="flex justify-center items-center text-lg ">
          "Arxtect: Revolutionizing Academic Publishing - This cutting-edge platform combines a scalable LaTeX editor with a decentralized approach, offering token-based incentives for peer review and citations. It integrates a social networking aspect to foster community collaboration and employs advanced AI to enhance academic writing. Experience a new era in efficient, incentivized, and collaborative academic research and publication with Arxtect."
        </div>
      </div>
      {/* Solution */}
      <div className="bg-white p-8">
        <h1 className="text-4xl font-bold">Solution</h1>
        <div className="flex justify-center items-center">
          <div className="flex flex-col md:flex-row items-center justify-between px-8">
            <div className="md:w-1/2 pr-[80px]">
              <p className="text-lg mb-[70px]">
                A decentralized ecosystem that actively involves authors, editors, and reviewers, which introduces innovative new revenue models for scholarly publishing.
              </p>
              <ul className="list-none">
                <li className="mb-8">
                  <div className="bg-[#9ac189] rounded-full px-6 py-2 inline-flex items-center">
                    <span className="h-3 w-3 bg-black rounded-full mr-3"></span>
                    Profit redistribution
                  </div>
                </li>
                <li>
                  <div className="bg-[#9ac189] rounded-full px-6 py-2  inline-flex items-center">
                    <span className="h-3 w-3 bg-black rounded-full mr-3"></span>
                    Decentralization
                  </div>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <img src="./assets/solution.png" alt="Circular diagram with arrows indicating a cycle between Journal, Author, Editor, and Reviewer, with 'Activate the Whole System' in the center" />
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* Technology */}
      <div className="bg-white p-8">
        <h1 className="text-4xl font-bold mb-10">Technology</h1>
        <div className="flex justify-between">
          <div className="w-1/3 bg-white p-6 shadow-xl border border-gray-300">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Web3.0</h2>
            <p className="mb-6 text-gray-600">
              Web 3.0 marks the next stage in the evolution of the internet, integrating ideas
              like decentralization, blockchain technology, and a token-based economy.
              This approach transforms how digital content generates income, ensuring a more
              secure and equitable distribution process.
            </p>
            <div className="text-center  bg-gray-300">
              <IconButton>
                <ArrowDownwardIcon />
              </IconButton>
            </div>
            <ul className="list-disc pl-6 mt-4 text-gray-600">
              <li>Global payment</li>
              <li>Transparency</li>
              <li>Accessibility</li>
              <li>Security</li>
            </ul>
          </div>
          <div className="w-1/3 bg-white p-6 shadow-xl border border-gray-300 mx-4">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">AI</h2>
            <p className="mb-6 text-gray-600">
              Artificial Intelligence is ushering in a new era of research, particularly with the
              availability of Large Language Models (LLMs) to researchers worldwide. These
              models serve as vast repositories of knowledge and offer assistance in diverse
              aspects of various research fields.
            </p>
            <div className="text-center  bg-gray-300">
              <IconButton>
                <ArrowDownwardIcon />
              </IconButton>
            </div>
            <ul className="list-disc pl-6 mt-4 text-gray-600">
              <li>Academic writing</li>
              <li>Reviewer & Journal recommendation</li>
              <li>Paper summary & explanation</li>
              <li>Research assistant</li>
            </ul>
          </div>
          <div className="w-1/3 bg-white p-6 shadow-xl border border-gray-300">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">WASM</h2>
            <p className="mb-6 text-gray-600">
              WebAssembly is a binary instruction format tailored for a stack-based virtual
              machine. It's created as a universal compilation target for high-level
              programming languages, e.g., C, C++. This technology is designed to helping to
              reduce server load and enhance front-end performance..
            </p>
            <div className="text-center  bg-gray-300">
              <IconButton>
                <ArrowDownwardIcon />
              </IconButton>
            </div>
            <ul className="list-disc pl-6 mt-4 text-gray-600">
              <li>Scalability (Edge Computing)</li>
              <li>Privacy</li>
              <li>Cross-Platform</li>
              <li>High performance</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Products */}
      <div className="bg-white p-8">
        <h1 className="text-4xl font-bold mb-10">Products</h1>

        <div className="flex justify-center items-center my-6">
          <div className="flex divide-x w-full">
            <div className="w-1/2 pr-8">
              <ul className="list-disc pl-5 space-y-4">
                <li className="text-lg">
                  <strong>Editor:</strong> online collaborative editor with AI assistant
                </li>
                <li className="text-lg">
                  <strong>Network:</strong> social platform for researchers
                </li>
                <li className="text-lg">
                  <strong>Publishing:</strong> decentralized scholarly publishing: arXiv + peer reviewed journal
                </li>
              </ul>
            </div>
            <div className="w-1/2 pl-8">
              <button className="bg-[#cccccc] text-white font-bold py-2 px-4 rounded-full mb-3 w-full">Editor + arXiv</button>
              <button className="bg-[#b7b7b7] text-white font-bold py-2 px-4 rounded-full mb-3 w-full">Journal as a Service</button>
              <button className="bg-[#999999] text-white font-bold py-2 px-4 rounded-full w-full">Social Platform</button>
            </div>
          </div>
        </div>
      </div>
      {/* Editor  */}
      <div className=" p-8 bg-white">
        <h1 className="text-4xl font-bold mb-10">Editor (Newton)</h1>

        <div className="flex flex-row">

          <div className="flex-1">
            <ul class="list-disc ml-5 mt-6 ">
              <li class="text-lg tracking-wide mb-[30px]">Collaborative editor is of great importance in academic writing. It is the traffic source.</li>
              <li class="text-lg tracking-wide mb-[30px]">Overleaf has got more than 10 millions of users in 2022.</li>
              <li class="text-lg tracking-wide mb-[30px]">When deadline comes, most of users have experienced the downtime of Overleaf.</li>
              <li class="text-lg tracking-wide mb-[30px]">Researchers should not spend too much time on writing instead of research itself.</li>
            </ul>
            <div className="mt-[50px]">
              <table className="table-auto w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 text-center"></th>
                    <th className="px-4 py-2 text-center">Tech</th>
                    <th className="px-4 py-2 text-center">Scalability</th>
                    <th className="px-4 py-2 text-center">Tools</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2 text-center">Newton</td>
                    <td className="border px-4 py-2 text-center">WASM</td>
                    <td className="border px-4 py-2 text-center">High</td>
                    <td className="border px-4 py-2 text-center">AI, Preprint</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="border px-4 py-2 text-center">Overleaf</td>
                    <td className="border px-4 py-2 text-center">Cloud</td>
                    <td className="border px-4 py-2 text-center">Low</td>
                    <td className="border px-4 py-2 text-center">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
          <div className="flex-1 ml-4">
            <img src="./assets/editor1.png" alt="Placeholder image of a web-based text editor interface" className="border mb-4" />
            <img src="./assets/editor2.png" alt="Placeholder image of a web-based text editor interface with a sample document" className="border" />
          </div>
        </div>
      </div>
      {/* Market */}
      <div className="bg-white p-8">
        <h1 className="text-3xl font-bold my-6">Market</h1>
        <div className="flex flex-row justify-between">
          <div className="w-1/3  px-8 py-4">
            <img src="./assets/Market1.png" alt="Bar chart representing Market Size with Music, Scholarly Publishing, and SVoD categories" className="mb-4" />
          </div>
          <div className="w-1/3  px-8 py-4">
            <img src="./assets/Market2.png" alt="Bar chart representing Profit Margin @2022 with Spotify, RELX (Elsevier), and Netflix categories" className="mb-4" />
          </div>
          <div className="w-1/3  px-8 py-4">
            <img src="./assets/Market3.png" alt="Bar chart representing Market Cap @2022 with Spotify, RELX (Elsevier), and Netflix categories" className="mb-4" />
          </div>
        </div>
        <ul className="list-disc pl-6 mt-6">
          <li className="mb-2">Scholarly publishing has a market size as large as music industry and ⅓ of Subscription Video on Demand (SVoD)</li>
          <li className="mb-2">The profit margin in scholarly publishing significantly exceeds that of the music industry and SVoD services, resulting in scholarly publishing and SVoD having comparable net incomes.</li>
          <li>If the Price-to-Earnings ratio (PE) is consistent, then there should be a company in the scholarly publishing sector with a valuation comparable to Netflix's, which is around $195 billion.</li>
        </ul>
      </div>
      {/* Timeline  */}
      <div className=" p-8">
        <h1 className="text-3xl font-bold mb-6">Timeline</h1>
        <div className="grid grid-cols-4 gap-4 mb-4 ml-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Editor:</h2>
            <ul className="list-disc ml-8">
              <li>WASM</li>
              <li>Collaborative</li>
              <li>AI assistance</li>
              <li>ID system</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Network:</h2>
            <ul className="list-disc ml-8">
              <li>Preprint</li>
              <li>Profile system</li>
              <li>Interactive</li>
              <li>Community</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Publish:</h2>
            <ul className="list-disc ml-8">
              <li>Submission</li>
              <li>Review</li>
              <li>Tokenization</li>
              <li>Go public</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Optimization:</h2>
            <ul className="list-disc ml-8">
              <li>AI tools</li>
              <li>SocialFi</li>
              <li>Publishing system</li>
              <li>Community</li>
            </ul>
          </div>
        </div>
        <div className="relative">
          <img src="./assets/timeline.png" className="w-full" alt="" />
          <div className="grid grid-cols-4 gap-4">
            <span className="relative z-10 px-4 bg-white  text-center">2023</span>
            <span className="relative z-10 px-4 bg-white  text-center">2024 Q1</span>
            <span className="relative z-10 px-4 bg-white  text-center">2024 Q2</span>
            <span className="relative z-10 px-4 bg-white  text-center">2024 Q3</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-700 text-white p-4 text-center">Reputation system</div>
          <div className="bg-gray-700 text-white p-4 text-center">Smart Manuscript</div>
          <div className="bg-gray-700 text-white p-4 text-center">DeFi</div>
          <div className="bg-gray-700 text-white p-4 text-center ">Fund/Award raising</div>
        </div>
      </div>
      {/* Business Model */}
      <div className="bg-white p-8">
        <h1 className="text-4xl font-bold mb-10">Business Model</h1>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 text-white p-4">
            <h2 className="text-lg font-bold mb-3">01</h2>
            <p>Transaction Fee</p>
          </div>
          <div className="col-span-2 bg-gray-300 p-4">
            <ul className="list-disc ml-4">
              <li>Author/Editor/Reviewer/Journal income</li>
              <li>Key trading</li>
              <li>Award/Fund raising</li>
            </ul>
          </div>
          <div className="bg-gray-800 text-white p-4">
            <h2 className="text-lg font-bold mb-3">02</h2>
            <p>AI assistant</p>
          </div>
          <div className="col-span-2 bg-gray-300 p-4">
            <ul className="list-disc ml-4">
              <li>Formatting (Latex)</li>
              <li>Rephrasing</li>
              <li>Paper summary</li>
            </ul>
          </div>
          <div className="bg-gray-800 text-white p-4">
            <h2 className="text-lg font-bold mb-3">03</h2>
            <p>Cloud storage</p>
          </div>
          <div className="col-span-2 bg-gray-300 p-4">
            <ul className="list-disc ml-4">
              <li>Manuscript</li>
              <li>Pictures</li>
              <li>Meta data</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Pioneers */}
      <div className=" p-8 bg-white">
        <h1 className="text-4xl font-bold mb-10">Pioneers</h1>
        <div className="flex">
          <div className="w-1/2">
            <div className="flex items-center mb-4">
              <img src="./assets/Pioneers2.png" alt="Pixelated avatar of a person wearing a hat" className="mr-4  w-[100px] h-[100px]" />
              <div>
                <h2 className="font-bold">G. Chew, PhD</h2>
                <p>Serial entrepreneur, mentor@Havard Blockchain Accelerator & Berkeley Blockchain Xcelerator Stanford-affiliated researcher more 6 yrs experience in Web3, Stanford University</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <img src="./assets/Pioneers3.png" alt="Pixelated avatar of a person with green background" className="mr-4  w-[100px] h-[100px]" />
              <div>
                <h2 className="font-bold">A. Ong</h2>
                <p>Serial entrepreneur, software architect and Sr. SWE WASM, database, backend services Snowflake, Amazon, UW-Madison</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <img src="./assets/Pioneers4.png" alt="Animated avatar of a person with purple hair" className="mr-4  w-[100px] h-[100px]" />
              <div>
                <h2 className="font-bold">A. Lee</h2>
                <p>Serial entrepreneur Operation, Business development JP Morgan, UChicago</p>
              </div>
            </div>
            <div className="flex items-center">
              <img src="./assets/Pioneers5.png" alt="Cartoon avatar of a person with an orange background" className="mr-4 w-[100px] h-[100px]" />
              <div>
                <h2 className="font-bold">Z. Chang</h2>
                <p>Serial entrepreneur, investor Product design DHVC, Stanford University</p>
              </div>
            </div>
          </div>
          <div className="w-1/2 pl-10">
            <img src="./assets/Pioneers1.png" alt="Logo of Stanford University" />
          </div>
        </div>
      </div>
      {/* Make research no barrier */}
      <div className="bg-white p-8">
        <div className="flex flex-col items-start">
          <h1 className="text-4xl font-bold mb-10">Make research no barrier</h1>
          <div className="flex justify-center items-center w-full">
            <img src="./assets/barrier.png" alt="Dotted world map with market share bubbles"
              className="w-[90%] h-auto object-cover mx-auto" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
