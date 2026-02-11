'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, 
  Settings, LogOut, Tag, CreditCard, FileText, ChevronDown, ChevronRight, Menu, X 
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleMenu = (name) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  // --- REINTEGRADO EL ESQUELETO COMPLETO PACTADO ---
  const menuItems = [
    { 
      name: 'Inicio', 
      href: '/admin', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Estadísticas', 
      icon: LayoutDashboard, 
      submenu: [
        { name: 'Visión General', href: '/admin/estadisticas' },
        { name: 'Pagos', href: '/admin/estadisticas/pagos' },
        { name: 'Envíos', href: '/admin/estadisticas/envios' },
        { name: 'Tráfico', href: '/admin/estadisticas/trafico' },
      ] 
    },
    { 
      name: 'Ventas', 
      icon: ShoppingBag, 
      submenu: [
        { name: 'Pedidos', href: '/admin/ventas/pedidos' },
        { name: 'Carritos Abandonados', href: '/admin/ventas/abandonados' },
      ]
    },
    { 
      name: 'Productos', 
      icon: Package, 
      submenu: [
        { name: 'Lista de Productos', href: '/admin/productos' },
        { name: 'Inventario', href: '/admin/productos/inventario' },
        { name: 'Categorías', href: '/admin/productos/categorias' },
      ]
    },
    { 
      name: 'Motor Promociones', 
      icon: Tag, 
      submenu: [
        { name: 'Crear Regla', href: '/admin/promociones/crear' },
        { name: 'Reglas Activas', href: '/admin/promociones' },
      ]
    },
    { 
      name: 'ARCA', 
      icon: FileText, 
      submenu: [
        { name: 'Emitir Facturas', href: '/admin/arca/emitir' },
        { name: 'Emitir Notas de Crédito', href: '/admin/arca/notas-credito' },
        { name: 'Historial', href: '/admin/arca/historial' },
      ]
    },
    { 
      name: 'Clientes', 
      icon: Users, 
      submenu: [
        { name: 'Lista de Clientes', href: '/admin/clientes' },
        { name: 'Mensajes / Consultas', href: '/admin/clientes/mensajes' },
      ]
    },
    { 
      name: 'Finanzas', 
      icon: CreditCard, 
      submenu: [
        { name: 'Flujo de Caja', href: '/admin/finanzas/flujo' },
        { name: 'Gastos Operativos', href: '/admin/finanzas/gastos' },
      ]
    },
    { 
      name: 'Configuración', 
      icon: Settings, 
      submenu: [
        { name: 'Pagos', href: '/admin/configuracion/pagos' },
        { name: 'Envíos', href: '/admin/configuracion/envios' },
        { name: 'Información de contacto', href: '/admin/configuracion/contacto' },
        { name: 'Botón de WhatsApp', href: '/admin/configuracion/whatsapp' },
        { name: 'E-mails automáticos', href: '/admin/configuracion/emails' },
      ]
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* SIDEBAR RESPONSIVE */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#111] text-white transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h1 className="text-2xl font-black tracking-tighter text-[#c6a35a]">ADMIN</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
                <X size={24} />
            </button>
        </div>

        <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = openMenu === item.name;
              const isChildActive = hasSubmenu && item.submenu.some(sub => pathname.startsWith(sub.href));

              return (
                <div key={item.name}>
                    <div 
                        onClick={() => hasSubmenu ? toggleMenu(item.name) : null}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isChildActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={20} className={isChildActive ? 'text-[#c6a35a]' : 'currentColor'} />
                            {hasSubmenu ? (
                                <span className="font-bold text-[16px]">{item.name}</span>
                            ) : (
                                <Link href={item.href} className="font-bold text-[16px] w-full">{item.name}</Link>
                            )}
                        </div>
                        {hasSubmenu && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                    </div>

                    {hasSubmenu && isExpanded && (
                        <div className="mt-1 ml-4 border-l-2 border-[#c6a35a]/30 space-y-1">
                            {item.submenu.map((subItem) => (
                                <Link 
                                    key={subItem.name}
                                    href={subItem.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`block py-2 px-6 text-[14px] font-medium transition-colors ${pathname === subItem.href ? 'text-[#c6a35a]' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {subItem.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
              );
            })}
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600">
                <Menu size={24} />
            </button>
            <h2 className="text-sm font-black uppercase text-gray-400 tracking-widest hidden sm:block">Panel de Control</h2>
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300"></div>
            </div>
        </header>

        <main className="p-4 lg:p-10">
            {children}
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}