import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/Button";

const Editor = () => {
  return (
    <div className="bg-white">
      {/* <h1 className="text-4xl font-bold d mb-[70px]">Editor (Newton)</h1> */}
      <div className="flex flex-row">
        <div className="flex-1">
          <ul className="list-disc ml-5 mt-6 ">
            <li className="text-lg tracking-wide mb-[30px]">
              Collaborative editor is of great importance in academic writing.
              It is the traffic source.
            </li>
            <li className="text-lg tracking-wide mb-[30px]">
              Overleaf has got more than 10 millions of users in 2022.
            </li>
            <li className="text-lg tracking-wide mb-[30px]">
              When deadline comes, most of users have experienced the downtime
              of Overleaf.
            </li>
            <li className="text-lg tracking-wide mb-[30px]">
              Researchers should not spend too much time on writing instead of
              research itself.
            </li>
          </ul>
          <div className="my-[50px]">
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
          <Link to="/arxtect">
            <Button> GO TO Editor(Newton) DEMO</Button>
          </Link>
        </div>
        <div className="flex-1 ml-4">
          <img
            src="./assets/editor1.png"
            alt="Placeholder image of a web-based text editor interface"
            className="border mb-4"
          />
          <img
            src="./assets/editor2.png"
            alt="Placeholder image of a web-based text editor interface with a sample document"
            className="border"
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
