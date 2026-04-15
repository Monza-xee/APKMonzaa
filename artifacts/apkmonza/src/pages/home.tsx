import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Home() {
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from("ListAPKGAME")
      .select("*")

    if (error) {
      console.log(error)
      setError("Gagal memuat data. Coba lagi.")
    } else {
      setData(data)
    }

    setLoading(false)
  }

  const filteredData = data
    .filter(item =>
      (item.name ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .filter(item => {
      if (filter === "ALL") return true
      return item.type === filter
    })

  return (
    <div style={{ padding: 20 }}>

      {/* SEARCH */}
      <input
        placeholder="SEARCH CATALOG..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          border: "3px solid black",
          boxShadow: "4px 4px 0 black",
          fontWeight: "bold",
          marginBottom: 20,
          boxSizing: "border-box"
        }}
      />

      {/* FILTER */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["ALL", "GAME", "APP"].map(btn => (
          <button
            key={btn}
            onClick={() => setFilter(btn)}
            style={{
              padding: "10px 20px",
              border: "3px solid black",
              boxShadow: "4px 4px 0 black",
              background: filter === btn ? "#FFD600" : "#fff",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* LOADING STATE */}
      {loading && (
        <p style={{ fontWeight: "bold", textAlign: "center" }}>Loading...</p>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div
          style={{
            border: "3px solid black",
            boxShadow: "4px 4px 0 black",
            padding: 16,
            background: "#FFD6D6",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span>⚠️ {error}</span>
          <button
            onClick={fetchData}
            style={{
              padding: "8px 16px",
              border: "3px solid black",
              boxShadow: "3px 3px 0 black",
              background: "#fff",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredData.length === 0 && (
        <p style={{ fontWeight: "bold", textAlign: "center", marginTop: 40 }}>
          Tidak ada hasil ditemukan.
        </p>
      )}

      {/* LIST */}
      {!loading && !error && filteredData.map((item) => (
        <div
          key={item.id}
          style={{
            border: "3px solid black",
            boxShadow: "6px 6px 0 black",
            padding: 16,
            marginTop: 20,
            background: "#eee"
          }}
        >

          {/* MOD INFO */}
          <div
            style={{
              background: "#d9cfe8",
              border: "3px solid black",
              boxShadow: "4px 4px 0 black",
              padding: 10,
              marginBottom: 10,
              fontWeight: "bold"
            }}
          >
            ⚡ MOD INFO
            <div style={{ fontWeight: "normal" }}>
              {item.mod_info ?? "-"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 15 }}>
            {/* ICON */}
            <div
              style={{
                background: item.icon_color || "yellow",
                border: "3px solid black",
                padding: 15,
                fontWeight: "bold",
                flexShrink: 0
              }}
            >
              {item.icon_initials ?? "?"}
            </div>

            {/* INFO */}
            <div>
              <h2 style={{ margin: 0 }}>{item.name ?? "Unknown"}</h2>
              <p style={{ margin: "5px 0" }}>
                {item.version ?? "-"} • {item.size ?? "-"}
              </p>
              <p>{item.description ?? ""}</p>

              {/* TAG */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[item.tag1, item.tag2, item.tag3].filter(Boolean).map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      border: "3px solid black",
                      padding: "5px 10px",
                      fontWeight: "bold",
                      background:
                        tag === "OFFLINE"
                          ? "#7B3FE4"
                          : tag === "GAME"
                          ? "#FFD600"
                          : "#fff"
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      ))}
    </div>
  )
}
