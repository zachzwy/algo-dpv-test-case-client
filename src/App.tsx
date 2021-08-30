import axios from "axios";
import { RefObject, useState, createRef } from "react";
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
import "./App.css";

const fcode = `def make_changes(coins, target):`;

function App() {
  const [results, setResults] = useState("");
  const [onlyFail, setOnlyFail] = useState(false);
  const myRef = createRef();

  const onSubmit = async () => {
    const code = (myRef.current as HTMLTextAreaElement).value;
    const res = await axios.get("http://localhost:8080/submit", {
      params: {
        code,
      },
    });
    setResults(res.data);
  };

  return (
    <div className="App">
      <TextareaAutosize
        ref={myRef as RefObject<HTMLTextAreaElement>}
        minRows={30}
        maxRows={30}
        aria-label="maximum height"
        placeholder="Maximum 4 rows"
        defaultValue={fcode}
      />
      <div className="submit">
        <Button variant="outlined" onClick={onSubmit}>
          Submit
        </Button>
      </div>
      <div>
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
              label="Only display failed tests"
            />

            <List>
              {results.map(
                (res, i) =>
                  (!onlyFail || (onlyFail && res.includes("actual"))) && (
                    <ListItem>
                      <ListItemIcon>
                        {res.includes("actual") ? (
                          <ClearIcon className="fail-icon" />
                        ) : (
                          <CheckIcon className="pass-icon" />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={res} />
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
