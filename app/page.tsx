"use client";
import { FINANCEIRO_BACKEND_URL } from "@/app/constants/constants";
import { Registro } from '@/app/interfaces/interfaces';
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Paper from "@mui/material/Paper";
import Select from '@mui/material/Select';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import ToggleButton from '@mui/material/ToggleButton';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import MyBarChart from "./chart/barChart";
import './page.css';
import { obterPorcentagemDaCompra, obterPorcentagemSemanalDaCompra } from "./services/registros/registrosServices";

function createData(
  id: string,
  dtCorrente: Dayjs,
  descricao: string,
  valor: number,
  fonte: string,
  categoria: string | null,
  qtdParc: number,
  parcelaAtual: number,
  comentario: string,
  ehPago: boolean
) {
  return {
    id,
    dtCorrente,
    descricao,
    valor,
    fonte,
    categoria,
    qtdParc,
    parcelaAtual,
    comentario,
    ehPago
  };
}

const initialRows = [] as Registro[];

export default function Home() {
  const [showPagos, setShowPagos] = useState(true);
  const [pagarRegistrosFiltrados, setPagarRegistrosFiltrados] = useState(false);
  const [showAddOrUpdateComponent, setShowAddOrUpdateComponent] =
    useState(false);

  const [newRow, setNewRow] = useState(
    createData(
      "-1",
      dayjs().locale("pt-br"),
      "",
      0,
      "FONTE",
      "",
      1,
      1,
      "",
      false
    )
  );
  const [rows, setRows] = useState(initialRows);
  const [filteredRows, setFilteredRows] = useState(initialRows);
  const [editRow, setEditRow] = useState("");
  const [filtros, setFiltros] = useState<{filtro_meses: string, filtro_descricao: string, filtro_fonte: string}>({filtro_meses: "", filtro_fonte: "", filtro_descricao: ""});
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dt: Dayjs, i: number) => {
    return dt.add(i, 'months');
  };

  const add = () => {
    let parsedNewRow: Registro[] = [];
    const idComum = uuidv4();
    for (let i = 0; i < newRow.qtdParc; i++)
      parsedNewRow.push({
        ...newRow,
        valor: (newRow.descricao.indexOf(":") != -1 ? -1 : 1) * newRow.valor / newRow.qtdParc,
        dtCorrente: formatDate(newRow.dtCorrente, i),
        id: uuidv4(),
        idComum,
        parcelaAtual: i + 1
      });

    
    const newRows = [...rows, newRow];
    setRows(newRows);
    setFilteredRows([...filteredRows, ...parsedNewRow]);
    setShowAddOrUpdateComponent(false);

    persistInBulk(parsedNewRow);
  };

  useEffect(() => {
    let filtered = [] as Registro[];
    if (Object.keys(filtros).findIndex(x => filtros[x]) === -1) setFilteredRows(rows);
    else{
      if (filtros.filtro_meses) 
        filtered = rows.filter(({ dtCorrente }) => {
          const aux = dayjs(dtCorrente).month();
          return filtros.filtro_meses.split(";").indexOf(aux + 1 + "") !== -1 && dayjs().year() === dayjs(dtCorrente).year();
        });
        
      if (filtros.filtro_descricao)
        filtered = (Object.keys(filtered).length ? filtered : rows).filter(({ descricao }) => {
          return descricao.toLowerCase().indexOf(filtros.filtro_descricao.toLowerCase()) !== -1;
        });

      if (filtros.filtro_fonte)
        filtered = (Object.keys(filtered).length ? filtered : rows).filter(({ fonte }) => {
          return fonte.toLowerCase().indexOf(filtros.filtro_fonte.toLowerCase()) !== -1;
        });

      if (!showPagos)
        filtered = (Object.keys(filtered).length ? filtered : rows).filter(({ ehPago }) => {
          return ehPago === false || !ehPago;
        });


      setFilteredRows(sort(filtered));
      
    }
  }, [filtros, showPagos]);;

  const sort = (data: Registro[]) => {
    return data.toSorted((a, b) => {
        if (a.dtCorrente.valueOf() < b.dtCorrente.valueOf()) return -1;
        if (a.dtCorrente.valueOf() > b.dtCorrente.valueOf()) return 1;
        return 0;
      });
  };

  const getEditableComponent = (
    row: Registro,
    label: string,
    propertyName: string,
    type=""
  ) => {
    if (editRow === row.id)
      return (
        <TextField
          id="outlined-basic"
          label={label}
          variant="outlined"
          value={
            typeof row[propertyName] === "number"
              ? parseFloat(row[propertyName] as any).toFixed(2)
              : row[propertyName]
          }
          onChange={(e) => {
            setFilteredRows([
              ...filteredRows.map((x) => {
                if (x.id === editRow)
                  return {
                    ...row,
                    [propertyName]: e.target.value,
                  };
                return x;
              }),
            ]);
          }}
        />
      );

      if (type === "data")
        return dayjs(row[propertyName]).format("DD/MM/YYYY");

      if (type === "number")
        return parseFloat(row[propertyName]).toFixed(2);

      if (!type)
        return row[propertyName];
  };

  useEffect(() => {
    getPersisted();
  }, []);

  useEffect(() => {
    if (localStorage.getItem("filtro"))
      setFiltros(JSON.parse(localStorage.getItem("filtro")));
  }, [isLoading]);

  const getPersisted = async () => {
    setIsLoading(true);
    const response = await fetch(FINANCEIRO_BACKEND_URL, { method: "GET" });
    const rows = await response.json();
    setRows(rows);
    setFilteredRows(rows);
    setIsLoading(false);
    console.log(rows)
  };

  const persist = async (toBePersisted: Registro, method="POST") => {    
    await fetch(FINANCEIRO_BACKEND_URL, {
      method,
      body: JSON.stringify(toBePersisted),
      headers: {
        "Content-Type": "application/json"
      }
    });
  };

  const persistInBulk = async (toBePersisted: Registro[], method="POST") => {    
    await fetch(FINANCEIRO_BACKEND_URL + "/bulk", {
      method,
      body: JSON.stringify(toBePersisted),
      headers: {
        "Content-Type": "application/json"
      }
    });
  };

  const deleteRow = async (id: String) => {
    await fetch(FINANCEIRO_BACKEND_URL + "/" + id , {
      method: "DELETE"
    });
  }

  return (
    <div>
      <MyBarChart data={rows}/>
    
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>
              <Checkbox defaultChecked />
            </TableCell>
            <TableCell>
              Mês{" "}
              <TextField
                id="outlined-basic"
                value={filtros.filtro_meses}
                onChange={(e) => {
                  const newFiltro = {
                    ...filtros,
                    filtro_meses: e.target.value
                  };
                  setFiltros(newFiltro)
                  localStorage.setItem("filtro", JSON.stringify(newFiltro));
                }}
                variant="outlined"
              />
            </TableCell>
            <TableCell>Descrição
            <TextField
                id="outlined-basic"
                value={filtros.filtro_descricao}
                onChange={(e) => {
                  const newFiltro = {
                    ...filtros,
                    filtro_descricao: e.target.value
                  };
                  setFiltros(newFiltro)

                  localStorage.setItem("filtro", JSON.stringify(newFiltro))
                }}
                variant="outlined"
              />

            </TableCell>
            <TableCell>Valor</TableCell>
            <TableCell>
              Fonte
              <TextField
                id="outlined-basic"
                value={filtros.filtro_fonte}
                onChange={(e) => {
                  const newFiltro = {
                    ...filtros,
                    filtro_fonte: e.target.value
                  };
                  setFiltros(newFiltro)

                  localStorage.setItem("filtro", JSON.stringify(newFiltro))
                }}
                variant="outlined"
              />

            </TableCell>
            <TableCell>Categoria</TableCell>
            <TableCell>Qtd Parcelas</TableCell>
            <TableCell>Comentário</TableCell>
            <TableCell>
              Exibir pagos
              <ToggleButton
                value="check"
                selected={showPagos}
                onChange={() => setShowPagos((prevSelected) => !prevSelected)}
              >
                <CheckIcon />
              </ToggleButton>

              <ToggleButton
                value="check"
                selected={showPagos}
                onChange={() => {
                  persistInBulk(filteredRows.map(filtered => ({...filtered, ehPago: !pagarRegistrosFiltrados})))
                  setPagarRegistrosFiltrados(!pagarRegistrosFiltrados)
                }}
              >
                <AttachMoneyIcon />
              </ToggleButton>

            </TableCell>
            <TableCell>
              <AddIcon onClick={() => setShowAddOrUpdateComponent(true)} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {showAddOrUpdateComponent ? (
            <>
            <TableRow key={-1}>
              <TableCell colSpan={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Mês"
                  format="DD/MM/YYYY"
                  value={dayjs(newRow.dtCorrente).locale("pt-br")}
                  onChange={(value) =>{
                    setNewRow({ ...newRow, dtCorrente: dayjs(value) })
                  }
                    
                  }
                />
              </LocalizationProvider>
              <TextField
                  id="outlined-basic"
                  label="Descrição"
                  className="full-width"
                  variant="outlined"
                  onChange={(e) =>
                    setNewRow({ ...newRow, descricao: e.target.value })
                  }
                />
              </TableCell>
              <TableCell>
                <TextField
                  id="outlined-valor-compra"
                  type="number"
                  label="Valor"
                  variant="outlined"
                  onChange={(e) =>
                    setNewRow({ ...newRow, valor: newRow.descricao.indexOf(":") !== -1? 
                      -1 * parseFloat(e.target.value.replace(",", ".")) : parseFloat(e.target.value.replace(",", ".")) })
                  }
                />
              </TableCell>
              <TableCell colSpan={2}>
                 <Select
                    labelId="demo-simple-select-label"
                    id="outlined-basic-fonte"
                    className="full-width"
                    value={newRow.fonte}
                    onChange={(e) =>
                      setNewRow({ ...newRow, fonte: e.target.value })
                    }
                  >
                    <MenuItem value={"SANTANDER"}>SANTANDER</MenuItem>
                    <MenuItem value={"CAIXA"}>CAIXA</MenuItem>
                    <MenuItem value={"INTER"}>INTER</MenuItem>
                    <MenuItem value={"DEBITO"}>DEBITO</MenuItem>
                    <MenuItem value={"FONTE"}>FONTE</MenuItem>                    
                  </Select>
                  <TextField
                  id="outlined-basic"
                  label="Qtd Parcelas"
                  variant="outlined"
                  value={newRow.qtdParc}
                  type="number"
                  onChange={(e) =>
                    setNewRow({ ...newRow, qtdParc: parseInt(e.target.value) })
                  }
                />
                  
              </TableCell>
              <TableCell colSpan={2}>
              <TextField
                    id="outlined-basic"
                    label="Categoria"
                    variant="outlined"
                    onChange={(e) =>
                      setNewRow({ ...newRow, categoria: e.target.value })
                    }
                  />
                 <TextField
                  id="outlined-basic"
                  label="Comentário"
                  variant="outlined"
                  onChange={(e) =>
                    setNewRow({ ...newRow, comentario: e.target.value })
                  }
                />
              </TableCell>
              <TableCell>
                <AddIcon onClick={() => add()} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>
                  Soma Parcelas:
                  {
                    newRow.valor * newRow.qtdParc
                  }
                </TableCell>
                <TableCell colSpan={2}>
                  % do Total:
                  {
                      obterPorcentagemDaCompra(newRow, filteredRows)
                  }
                </TableCell>
                <TableCell colSpan={2}>
                  % do total Semanal:
                  {
                    obterPorcentagemSemanalDaCompra(newRow, filteredRows)
                  }
                </TableCell>
            </TableRow>
            </>
          ) : (
            ""
          )}
          {filteredRows && filteredRows.map((row) => (
            <TableRow
              key={row.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 }, background: row.ehPago ? "green" : "white" }}
            >
              <TableCell>
                {getEditableComponent(row, "dtCorrente", "dtCorrente", "data")}
              </TableCell>
              <TableCell>
                {getEditableComponent(row, "descricao", "descricao")}
              </TableCell>
              <TableCell>
                {getEditableComponent(row, "Valor", "valor", "number")}
              </TableCell>
              <TableCell>
                {getEditableComponent(row, "Fonte", "fonte")}
              </TableCell>
              <TableCell>
                {getEditableComponent(row, "Categoria", "categoria")}
              </TableCell>
              <TableCell>
              { editRow !== row.id && row.parcelaAtual && row.parcelaAtual + "/"}
                {getEditableComponent(row, "qtdParc", "qtdParc")}
              </TableCell>
              <TableCell>
                {getEditableComponent(row, "Comentário", "comentario")}
              </TableCell>
              <TableCell>
                <ModeEditIcon
                  onClick={() => {
                    if (editRow === row.id) {
                      setEditRow("");
                      persist(row, "PUT");
                    } else setEditRow(row.id);
                  }}
                />
              </TableCell>
              <TableCell>
                <AttachMoneyIcon
                  onClick={() => {
                    persist({...row, ehPago: !(!!row.ehPago)}, "PUT");
                    setFilteredRows(
                      filteredRows.map(filtered => filtered.id != row.id ? filtered : {...row, ehPago: !(!!row.ehPago)})
                    )
                  }}
                />
              </TableCell>

              <TableCell>
                <CloseIcon
                  onClick={() => {
                    deleteRow(row.id);
                    setFilteredRows(filteredRows.filter(reg => row.id != reg.id))
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              Total:{" "}
              {parseFloat(
                filteredRows
                .filter(x => x.descricao !== "Salario")
                .reduce((a, c) => {
                  return parseFloat(a as any) + parseFloat(c.valor as any) as any;
                }, 0)
              ).toFixed(2)}
            </TableCell>
            <TableCell>
              Soma:{" "}
              {parseFloat(
                filteredRows
                .filter(x => x.descricao !== "Salario")
                .reduce((a, c) => {
                  return parseFloat(a as any) + Math.abs(parseFloat(c.valor as any)) as any;
                }, 0)
              ).toFixed(2)}
            </TableCell>


            <TableCell>
              Minhas despezas:{" "}
              {parseFloat(
                filteredRows
                .filter(x => x.descricao !== "Salario")
                .reduce((a, c) => {
                  return parseFloat(a as any) + parseFloat(c.valor > 0 ? c.valor : 0 as any) as any;
                }, 0)
              ).toFixed(2)}
            </TableCell>

            <TableCell>
              Sálario:{" "}
              {
                (() => {
                  const totalSalario = filteredRows
                    .filter((x) => x.descricao === "Salario")
                    .reduce((a, c) => a + parseFloat(c.valor as any), 0); // ✅ Ensure it returns a number

                  const result = -1 * (totalSalario); // ✅ Correct multiplication
                  return result.toFixed(2); 
                })()
                }
            </TableCell>

            <TableCell>
              A ser investido:{" "}
              {
                (() => {
                  const totalSalario = filteredRows
                    .filter((x) => x.descricao === "Salario")
                    .reduce((a, c) => a + parseFloat(c.valor as any), 0); // ✅ Ensure it returns a number

                  const result = -1 * (0.2 * totalSalario); // ✅ Correct multiplication
                  return result.toFixed(2); 
                })()
                }
            </TableCell>

            <TableCell>
              Restante:{" "}
              {
                (() => {
                  const totalSalario = filteredRows
                  .filter((x) => x.descricao === "Salario")
                  .reduce((a, c) => a + parseFloat(c.valor as any), 0); // ✅ Ensure it returns a number

                  const minhasDespesas = parseFloat(
                    filteredRows
                    .filter(x => x.descricao !== "Salario")
                    .reduce((a, c) => {
                      return parseFloat(a as any) + parseFloat(c.valor > 0 ? c.valor : 0 as any) as any;
                    }, 0)
                  )

                  const result = (-1 * (totalSalario)) - minhasDespesas; // ✅ Correct multiplication
                  
                  return result.toFixed(2); 
                })()
                }
            </TableCell>
            <TableCell>
              Restante - Invest:{" "}
              {
                (() => {
                  const totalSalario = filteredRows
                  .filter((x) => x.descricao === "Salario")
                  .reduce((a, c) => a + parseFloat(c.valor as any), 0); // ✅ Ensure it returns a number

                  const totalInvestimento = (-1 * (0.2 * totalSalario))

                  const minhasDespesas = parseFloat(
                    filteredRows
                    .filter(x => x.descricao !== "Salario")
                    .reduce((a, c) => {
                      return parseFloat(a as any) + parseFloat(c.valor > 0 ? c.valor : 0 as any) as any;
                    }, 0)
                  )


                  const result = (-1 * (totalSalario)) - minhasDespesas - totalInvestimento; // ✅ Correct multiplication
                  
                  return result.toFixed(2); 
                })()
                }
            </TableCell>

          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
    </div>
  );
}
