'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, 
  Settings, LogOut, Tag, CreditCard, Truck, FileText, ChevronDown, ChevronRight, MessageCircle, Mail, MapPin 
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (name) => {
    setOpenMenu(openMenu === name ? null : name);
  };

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
        { name: 'Pagos', href: '/admin/estadisticas/pagos' }, // Corregido: Solo Pagos
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
        { name: 'Crear Regla', href: '/admin/promociones/crear' }, // Corregido: Sin 4x3
        { name: 'Reglas Activas', href: '/admin/promociones' },
      ]
    },
    { 
      name: 'ARCA', 
      icon: FileText, 
      submenu: [
        { name: 'Emitir Facturas', href: '/admin/arca/emitir' }, // Desglosado
        { name: 'Emitir Notas de Crédito', href: '/admin/arca/notas-credito' }, // Desglosado
        { name: 'Historial', href: '/admin/arca/historial' }, // Desglosado
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
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* SIDEBAR FIJO IZQUIERDA */}
      <aside style={{
        width: '280px', // Un poco más ancho para que entren las letras grandes
        backgroundColor: '#111',
        color: 'white',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        borderRight: '1px solid #222'
      }}>
        
        {/* Header Logo */}
        <div style={{ padding: '25px 20px', borderBottom: '1px solid #333' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '2px', color: '#c6a35a', margin: 0 }}>ADMIN</h1>
        </div>

        {/* Navegación */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
            {menuItems.map((item) => {
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = openMenu === item.name;
              
              // Verificamos si estamos dentro de esta sección
              const isActiveParent = item.href ? pathname === item.href : false; 
              // Si tiene submenú, checkeamos si alguna hija está activa
              const isChildActive = hasSubmenu && item.submenu.some(sub => pathname.startsWith(sub.href));

              return (
                <div key={item.name}>
                    {/* BOTÓN PRINCIPAL */}
                    <div 
                        onClick={() => {
                            if (hasSubmenu) toggleMenu(item.name);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 24px', // Más padding
                            cursor: 'pointer',
                            color: isActiveParent || isChildActive || isExpanded ? 'white' : '#999',
                            backgroundColor: isActiveParent || isChildActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                            fontWeight: 'bold',
                            fontSize: '16px', // LETRA MÁS GRANDE
                            transition: '0.2s',
                            userSelect: 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <item.icon size={20} color={isActiveParent || isChildActive ? '#c6a35a' : 'currentColor'} />
                            {hasSubmenu ? (
                                <span>{item.name}</span>
                            ) : (
                                <Link href={item.href} style={{ color: 'inherit', textDecoration: 'none', width: '100%' }}>{item.name}</Link>
                            )}
                        </div>
                        {hasSubmenu && (
                            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                        )}
                    </div>

                    {/* SUBMENÚ */}
                    {hasSubmenu && isExpanded && (
                        <div style={{ backgroundColor: '#000', borderLeft: '4px solid #c6a35a' }}>
                            {item.submenu.map((subItem) => (
                                <Link 
                                    key={subItem.name}
                                    href={subItem.href}
                                    style={{
                                        display: 'block',
                                        padding: '12px 24px 12px 58px', // Más sangría y espacio
                                        fontSize: '14px', // Subtítulos un poco más chicos que los títulos pero legibles
                                        color: pathname === subItem.href ? '#c6a35a' : '#777',
                                        textDecoration: 'none',
                                        transition: '0.2s',
                                        fontWeight: '500'
                                    }}
                                    className="hover:text-white"
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

        {/* Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid #333', backgroundColor: '#111' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                <LogOut size={18} /> Volver a Tienda
            </Link>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ 
        marginLeft: '280px', // Ajustado al nuevo ancho del sidebar
        width: 'calc(100% - 280px)',
        backgroundColor: '#f3f4f6',
        minHeight: '100vh'
      }}>
        
        {/* Cabecera */}
        <header style={{ height: '70px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 40 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', color: '#374151', margin: 0 }}>Panel de Control</h2>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e5e7eb', border: '1px solid #d1d5db' }}></div>
        </header>

        {/* Área de trabajo */}
        <div style={{ padding: '40px' }}>
            {children}
        </div>

      </main>

    </div>
  );
}