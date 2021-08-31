import { useState } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import { Result } from "../types";

interface Props {
  results: Result;
  pass: number;
  total: number;
}

const ResultDisplay = ({ results, pass, total }: Props) => {
  const [onlyFail, setOnlyFail] = useState(false);
  return (
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
  );
};

export default ResultDisplay;
