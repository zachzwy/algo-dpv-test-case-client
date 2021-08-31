import axios from "axios";
import { useState } from "react";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import LinearProgress from "@material-ui/core/LinearProgress";
import { useEffect } from "react";

const endpoint = "https://algo-dpv-test-case-server.herokuapp.com"; // "http://localhost:8080"

function App() {
  const [results, setResults] = useState<
    string | Array<{ printStatement: string; isPass: boolean }>
  >("");
  const [onlyFail, setOnlyFail] = useState(false);
  const [availableProlems, setAvailableProblems] = useState<{
    [key: string]: { title: string; placeholder: { [key: string]: string } };
  }>({});
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

  const processRes = (data: string | Array<string>) => {
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

  const handleProblemChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const val = e.target.value as string;
    setSelectedProblem(val);
    if (selectedLanguage)
      setCode(availableProlems[val].placeholder[selectedLanguage]);
  };

  const handleLanguageChange = (e: React.ChangeEvent<{ value: unknown }>) => {
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
      <div className="result">
        {Array.isArray(results) ? (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={onlyFail}
                  onChange={() => setOnlyFail(!onlyFail)}
                  inputProps={{ "aria-label": "primary checkbox" }}
                />
              }
              label={`${pass}/${total} passed. Only display failed tests`}
            />

            <List>
              {results.map(
                (res, i) =>
                  (!onlyFail || (onlyFail && !res.isPass)) && (
                    <ListItem key={i}>
                      <ListItemIcon>
                        {res.isPass ? (
                          <CheckIcon className="pass-icon" />
                        ) : (
                          <ClearIcon className="fail-icon" />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={res.printStatement} />
                    </ListItem>
                  )
              )}
            </List>
          </>
        ) : (
          results
        )}
      </div>
    </div>
  );
}

export default App;
