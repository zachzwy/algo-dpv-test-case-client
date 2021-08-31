import axios from "axios";
import { useState, useEffect } from "react";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import LinearProgress from "@material-ui/core/LinearProgress";
import ResultDisplay from "./ResultDisplay";
import { endpoint } from "../utils";
import { Result, Data, Event, AvailableProblems } from "../types";

function App() {
  const [results, setResults] = useState<Result>("");
  const [availableProlems, setAvailableProblems] = useState<AvailableProblems>(
    {}
  );
  const [selectedProblem, setSelectedProblem] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [pass, setPass] = useState(0);
  const [total, setTotal] = useState(0);
  const [code, setCode] = useState(
    "Select the problem and language you want to test..."
  );

  const isResult = (str: string) =>
    str.substring(0, 3) === "@#$" && str.substring(str.length - 3) === "@#$";

  const processRes = (data: Data) => {
    if (typeof data === "string") return data;
    const res = [];
    let printStatement = "";

    for (let msg of data) {
      if (isResult(msg)) {
        msg = msg.substring(3, msg.length - 3);
        printStatement =
          msg + (printStatement ? "; stdout: " + printStatement : "");
        res.push({
          printStatement,
          isPass: !msg.includes("actual"),
        });
        printStatement = "";
      } else printStatement += msg + "; ";
    }
    return res;
  };

  const onSubmit = async () => {
    setResults("");
    setIsFetching(true);
    const resp = await axios.get(`${endpoint}/submit`, {
      params: {
        code,
        problem: selectedProblem,
        language: selectedLanguage,
      },
    });
    setIsFetching(false);
    const res = processRes(resp.data);
    setResults(res);

    if (Array.isArray(res)) {
      setTotal(res.length);
      setPass(res.filter((_) => _.isPass).length);
    }
  };

  const handleProblemChange = (e: Event) => {
    const val = e.target.value as string;
    setSelectedProblem(val);
    if (selectedLanguage)
      setCode(availableProlems[val].placeholder[selectedLanguage]);
  };

  const handleLanguageChange = (e: Event) => {
    const val = e.target.value as string;
    setSelectedLanguage(val);
    if (selectedProblem)
      setCode(availableProlems[selectedProblem].placeholder[val]);
  };

  useEffect(() => {
    const fetchAvailableProblem = async () => {
      const resp = await axios.get(`${endpoint}/problems`);
      setAvailableProblems(resp.data);
    };
    fetchAvailableProblem();
  }, []);

  return (
    <div className="App">
      <FormControl className="selector">
        <InputLabel id="demo-simple-select-label">Problem</InputLabel>
        <Select value={selectedProblem} onChange={handleProblemChange}>
          {Object.keys(availableProlems).map((key, i) => (
            <MenuItem key={i} value={key}>
              {availableProlems[key].title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl className="selector">
        <InputLabel id="demo-simple-select-helper-label">Language</InputLabel>
        <Select
          disabled={!selectedProblem}
          value={selectedLanguage}
          onChange={handleLanguageChange}
        >
          <MenuItem value="python">Python</MenuItem>
          <MenuItem value="cpp" disabled>
            C++
          </MenuItem>
          <MenuItem value="java" disabled>
            Java
          </MenuItem>
          <MenuItem value="javascript" disabled>
            JavaScript
          </MenuItem>
        </Select>
      </FormControl>
      <TextareaAutosize
        value={code}
        onChange={(e) => setCode(e.target.value)}
        minRows={30}
        maxRows={30}
        aria-label="maximum height"
        placeholder="Maximum 4 rows"
      />
      <div className="submit">
        <Button
          variant="outlined"
          onClick={onSubmit}
          disabled={!selectedProblem || !selectedLanguage}
        >
          Submit
        </Button>
      </div>
      {isFetching && <LinearProgress />}
      <ResultDisplay results={results} pass={pass} total={total} />
    </div>
  );
}

export default App;