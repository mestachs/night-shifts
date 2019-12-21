import XlsxPopulate from "./support/XlsxPopulateOpenAsBlob";
import React, { useState, useEffect } from "react";
import InputLabel from "@material-ui/core/InputLabel";
import _ from "lodash";

function UploadXlsPage(props) {
  function parseExcelFile(inputElement) {
    const files = inputElement.target.files || [];
    if (!files.length) return;
    const file = files[0];
    XlsxPopulate.fromDataAsync(file).then(function(workbook) {
      const fields = [
        "jour",
        "date",
        "gpicnic",
        "rnic",
        "rsip",
        "tnic",
        "tsip"
      ];
      const sheets = workbook.sheets();
      const watches = [];
      const doctorsSet = new Set();
      sheets.forEach(sheet => {
        sheet
          .range("A2:G36")
          .value()
          .filter(
            row => row[0] !== null && row[0] !== "" && row[0] !== undefined
          )
          .forEach(row => {
            const watch = {};
            row.forEach((fieldValue, index) => {
              let v = fieldValue;
              if (
                fieldValue &&
                fieldValue.includes &&
                fieldValue.includes("----")
              ) {
                fieldValue = undefined;
              }
              if (fields[index] == "date") {
                fieldValue = XlsxPopulate.numberToDate(fieldValue);
              }
              if (
                ["gpicnic", "rnic", "rsip", "tnic", "tsip"].includes(
                  fields[index]
                )
              ) {
                doctorsSet.add(fieldValue);
              }
              watch[fields[index]] = fieldValue;
            });
            watch["month"] = sheet.name();
            watches.push(watch);
          });
      });

      const doctors = Array.from(doctorsSet).sort();
      const days = [
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
        "Dimanche"
      ];

      const roles = ["gpicnic", "rnic", "rsip", "tnic", "tsip", "ALL"];

      const allStats = [];
      roles.forEach(role => {
        doctors.forEach(doctor => {
          const watches_doct = watches.filter(w =>
            role == "ALL"
              ? JSON.stringify(w).includes(doctor)
              : w[role] && w[role].includes(doctor)
          );

          const rawst = _.countBy(watches_doct, v => v.jour);
          const st = { role: role };

          st.doctor = doctor;
          let total = 0;
          days.forEach(day => {
            st[day] = rawst[day];
            if (rawst[day]) {
              total += rawst[day];
            }
          });
          st.total = total;
          allStats.push(st);
        });
      });
      const stats = allStats.filter(s => s.total !== 0);

      props.onChange({ watches, stats });
    });
  }
  return (
    <>
      <InputLabel>
        Upload your xslx file. (not data transfered to any server)
      </InputLabel>
      <input
        type="file"
        name="Xlsx"
        onChange={parseExcelFile}
        accept=".xlsx"
        helperText={"Your xlsx file"}
      ></input>
      <p>{}</p>
    </>
  );
}
export default UploadXlsPage;
