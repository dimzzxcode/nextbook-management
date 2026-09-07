import Link from "next/link";
export default function NotFound(){ return <div style={{padding:40,textAlign:"center"}}><h3>Kategori tidak ditemukan</h3><Link href="/categories" className="btn btn-primary">Kembali</Link></div> }
