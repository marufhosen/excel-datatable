import React, { useState } from "react";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import EmployerDataTable from "./EmployerDataTable";

const Home = () => {
  const [readExcelFile, setReadExcelFile] = useState({});
  const [excelData, setExcelData] = useState({});
  const [error, setError] = useState(null);
  const [getExcelDataFromDb, setGetExcelDataFromDb] = useState(null);
  const fileType = ["application/vnd.ms-excel"]; //only read excel(xls) type data

  const handleFile = (e) => {
    // get excel file from input
    let file = e.target.files[0];
    if (file && fileType.includes(file.type)) {
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = (e) => {
        setReadExcelFile(e.target.result);
        setError(null);
      };
    } else {
      setError("Only xls files allwed!");
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // convirt excel to json
    if (readExcelFile) {
      const workbook = XLSX.read(readExcelFile, { type: "buffer" });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      const dataField = {
        title: "Employee Field",
        employers: data,
      };

      //post employer data

      axios
        .post("http://localhost:5000/employer/addEmployee", dataField, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(
          (res) => {
            console.log("hit res", res);
            setGetExcelDataFromDb(res.data);
          },
          (err) => {
            console.log(err);
          }
        );
    } else {
      setExcelData(null);
    }
  };
  return (
    <div className="w-full bg-blue-50 min-h-screen">
      <div className="md:w-2/6 w-11/12 m-auto">
        <div>
          <p className="text-center p-5 font-bold">Handle Excel Data</p>
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            <input
              className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              type="file"
              onChange={handleFile}
            />
            <button
              disabled={error}
              type="submit"
              className="text-center w-full bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 my-5"
            >
              SUBMIT
            </button>
          </form>
        </div>

        {/* Display error message */}

        {error && (
          <div className="flex w-full mx-auto overflow-hidden bg-red-100">
            <div className="flex items-center justify-center w-14 bg-red-500">
              <FontAwesomeIcon
                className="text-white"
                icon={faCircleExclamation}
              />
            </div>
            <div className="px-2 py-2 -mx-3">
              <div className="mx-3">
                <span className="text-red-500 font-semibold">{error}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {getExcelDataFromDb ? (
        <EmployerDataTable employers={getExcelDataFromDb}></EmployerDataTable>
      ) : (
        <p className="text-center text-sm text-red-500">
          Please select a xecel(xls) file and view on the table.
        </p>
      )}
    </div>
  );
};

export default Home;
