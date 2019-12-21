import React, { useState } from "react";
import MUIDataTable from "mui-datatables";
import _ from "lodash";
import "./App.css";

import { PunchCard } from "react-punchcard";

import { HashRouter as Router } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import Paper from "@material-ui/core/Paper";
import MenuIcon from "@material-ui/icons/Menu";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";

import UploadXlsPage from "./UploadXlsPage";
import { TextField } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    width: "70%",
    margin: "auto",
    backgroundColor: "#eeeeee",
    height: "100%"
  },
  paper: {
    paddingBottom: "100%",
    paddingLeft: "100px",
    backgroundColor: "#eeeeee"
  },
  fab: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2)
  }
}));

const asRows = stats => {
  const rows = stats.map((stat, index) => {
    // {"role":"gpicnic","doctor":"egs","Lundi":3,"Mardi":5,"Mercredi":3,"Vendredi":2,"Samedi":5,"Dimanche":2,"total":20}
    return {
      id: "row-" + index,
      label: stat.role + " " + stat.doctor,
      points: [
        { x: 1, y: stat["Lundi"] || 0, label: "Lundi" },
        { x: 2, y: stat["Mardi"] || 0, label: "Mardi" },
        { x: 3, y: stat["Mercredi"] || 0, label: "Me" },
        { x: 4, y: stat["Jeudi"] || 0, label: "Je" },
        { x: 5, y: stat["Vendredi"] || 0, label: "Ve" },
        { x: 6, y: stat["Samedi"] || 0, label: "Sa" },
        { x: 7, y: stat["Dimanche"] || 0, label: "Di" }
      ]
    };
  });
  debugger;

  return rows;
};

function App() {
  const classes = useStyles();
  const [nightShits, setNightShits] = useState(undefined);

  const [filter, setFilter] = useState("SMEE");
  const setFilterDebounced = _.debounce(setFilter, 250, {
    maxWait: 1000
  });
  const onFilterChange = e => {
    const val = e.target.value;
    setFilterDebounced(val);
  };

  return (
    <Router>
      <div className={classes.root}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              href={"#/recipes/"}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit">
              Evaluate your night shift planning.
            </Typography>
          </Toolbar>
        </AppBar>

        <TextField onChange={onFilterChange} />

        {nightShits == undefined && <UploadXlsPage onChange={setNightShits} />}
        {nightShits && (
          <PunchCard
            value={asRows(nightShits.stats).filter(r =>
              r.label.includes(filter)
            )}
            renderAxisTick={p => <span>{p.label}</span>}
          />
        )}
        {nightShits && (
          <MUIDataTable
            title={"Stats per role & doctor"}
            options={{
              rowsPerPage: 30,
              rowsPerPageOptions: [30, 300, 1000],
              filterType: "dropdown",
              print: false,
              selectableRows: "none"
            }}
            data={nightShits.stats.filter(
              s => s.doctor.includes(filter) || s.role.includes(filter)
            )}
            columns={[
              "role",
              "doctor",
              "Lundi",
              "Mardi",
              "Mercredi",
              "Vendredi",
              "Samedi",
              "Dimanche",
              "total"
            ].map(name => {
              return {
                name: name,
                options: {
                  filter: true,
                  customBodyRender: v => (v ? v.toString() : "")
                }
              };
            })}
          />
        )}
        {nightShits && (
          <MUIDataTable
            title={"Scheduled night shifts"}
            options={{
              rowsPerPage: 30,
              rowsPerPageOptions: [20, 300, 1000],
              filterType: "dropdown",
              print: false,
              selectableRows: "none"
            }}
            data={nightShits.watches.filter(s =>
              JSON.stringify(s).includes(filter)
            )}
            columns={[
              "jour",
              "date",
              "gpicnic",
              "rnic",
              "rsip",
              "tnic",
              "tsip",
              "month"
            ].map(name => {
              return {
                name: name,
                options: {
                  filter: true,
                  customBodyRender: v =>
                    v
                      ? v instanceof Date
                        ? v
                            .getUTCDate()
                            .toString()
                            .padStart(2, "0") +
                          "/" +
                          (v.getUTCMonth() + 1).toString().padStart(2, "0")
                        : v
                      : ""
                }
              };
            })}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
