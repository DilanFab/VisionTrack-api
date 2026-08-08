import { Request, Response } from "express";
import prisma from "../../config/prisma";

// Obtener todos los movimientos de inventario con relaciones
export const getMovimientosInventario = async (req: Request, res: Response): Promise<void> => {
  try {
    const movimientos = await prisma.tbl_movimiento_inventario.findMany({
      include: {
        producto: {
          include: { categoria: true },
        },
        usuario: {
          select: {
            usuario_id: true,
            usuario_nombre: true,
          },
        },
      },
      orderBy: { movimiento_fecha: "desc" },
    });

    res.json({ success: true, data: movimientos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al obtener movimientos de inventario" });
  }
};

// Registrar un movimiento de inventario (ENTRADA, SALIDA, AJUSTE)
export const createMovimientoInventario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { producto_id, usuario_id, movimiento_tipo, movimiento_cantidad, movimiento_motivo } = req.body;

    if (!producto_id || !usuario_id || !movimiento_tipo || !movimiento_cantidad) {
      res.status(400).json({
        success: false,
        message: "Los campos producto, usuario, tipo de movimiento y cantidad son obligatorios",
      });
      return;
    }

    const cantidad = Number(movimiento_cantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      res.status(400).json({ success: false, message: "La cantidad debe ser un número entero positivo" });
      return;
    }

    const tipoUpper = movimiento_tipo.toUpperCase();
    if (!["ENTRADA", "SALIDA", "AJUSTE"].includes(tipoUpper)) {
      res.status(400).json({ success: false, message: "Tipo de movimiento inválido. Debe ser ENTRADA, SALIDA o AJUSTE" });
      return;
    }

    // Buscar producto
    const producto = await prisma.tbl_producto.findUnique({
      where: { producto_id: Number(producto_id) },
    });

    if (!producto) {
      res.status(404).json({ success: false, message: "Producto no encontrado" });
      return;
    }

    // Calcular el nuevo stock según el tipo de movimiento
    let nuevoStock = producto.producto_stock_actual;
    if (tipoUpper === "ENTRADA") {
      nuevoStock += cantidad;
    } else if (tipoUpper === "SALIDA") {
      if (producto.producto_stock_actual < cantidad) {
        res.status(400).json({
          success: false,
          message: `Stock insuficiente. Stock actual: ${producto.producto_stock_actual}, Intentas retirar: ${cantidad}`,
        });
        return;
      }
      nuevoStock -= cantidad;
    } else if (tipoUpper === "AJUSTE") {
      nuevoStock = cantidad; // Ajuste directo al nuevo stock
    }

    // Realizar transacción atómica: registrar movimiento y actualizar stock
    const [movimientoCreado, productoActualizado] = await prisma.$transaction([
      prisma.tbl_movimiento_inventario.create({
        data: {
          producto_id: Number(producto_id),
          usuario_id: Number(usuario_id),
          movimiento_tipo: tipoUpper,
          movimiento_cantidad: cantidad,
          movimiento_motivo: movimiento_motivo ? movimiento_motivo.trim() : null,
        },
        include: {
          producto: true,
          usuario: { select: { usuario_nombre: true } },
        },
      }),
      prisma.tbl_producto.update({
        where: { producto_id: Number(producto_id) },
        data: { producto_stock_actual: nuevoStock },
      }),
    ]);

    res.status(201).json({
      success: true,
      message: `Movimiento de ${tipoUpper} registrado con éxito. Nuevo stock: ${productoActualizado.producto_stock_actual}`,
      data: movimientoCreado,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al registrar movimiento de inventario" });
  }
};
