import { Request, Response } from "express";
import prisma from "../../config/prisma";

// Listar todos los productos con su categoría
export const getProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const productos = await prisma.tbl_producto.findMany({
      include: {
        categoria: true,
      },
      orderBy: { producto_nombre: "asc" },
    });
    res.json({ success: true, data: productos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al obtener productos" });
  }
};

// Obtener un producto por ID
export const getProductoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const producto = await prisma.tbl_producto.findUnique({
      where: { producto_id: Number(id) },
      include: {
        categoria: true,
        movimientos: {
          include: {
            usuario: {
              select: { usuario_nombre: true },
            },
          },
          orderBy: { movimiento_fecha: "desc" },
          take: 10,
        },
      },
    });

    if (!producto) {
      res.status(404).json({ success: false, message: "Producto no encontrado" });
      return;
    }

    res.json({ success: true, data: producto });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al buscar producto" });
  }
};

// Obtener productos con alerta de stock bajo
export const getProductosStockBajo = async (req: Request, res: Response): Promise<void> => {
  try {
    const productos = await prisma.tbl_producto.findMany({
      include: { categoria: true },
      orderBy: { producto_stock_actual: "asc" },
    });

    const productosBajos = productos.filter(
      (p) => p.producto_stock_actual <= p.producto_stock_minimo
    );

    res.json({ success: true, data: productosBajos, totalAlertas: productosBajos.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al obtener alertas de stock" });
  }
};

// Crear un nuevo producto
export const createProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      categoria_producto_id,
      producto_codigo,
      producto_nombre,
      producto_descripcion,
      producto_precio_unitario,
      producto_stock_actual,
      producto_stock_minimo,
      producto_unidad_medida,
    } = req.body;

    if (!categoria_producto_id || !producto_codigo || !producto_nombre || !producto_unidad_medida) {
      res.status(400).json({
        success: false,
        message: "Los campos categoría, código, nombre y unidad de medida son obligatorios",
      });
      return;
    }

    const nuevoProducto = await prisma.tbl_producto.create({
      data: {
        categoria_producto_id: Number(categoria_producto_id),
        producto_codigo: producto_codigo.trim(),
        producto_nombre: producto_nombre.trim(),
        producto_descripcion: producto_descripcion ? producto_descripcion.trim() : null,
        producto_precio_unitario: producto_precio_unitario ? Number(producto_precio_unitario) : 0,
        producto_stock_actual: producto_stock_actual ? Number(producto_stock_actual) : 0,
        producto_stock_minimo: producto_stock_minimo ? Number(producto_stock_minimo) : 5,
        producto_unidad_medida: producto_unidad_medida.trim(),
      },
      include: {
        categoria: true,
      },
    });

    res.status(201).json({ success: true, message: "Producto registrado exitosamente", data: nuevoProducto });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(400).json({ success: false, message: "Ya existe un producto con ese código/SKU" });
      return;
    }
    res.status(500).json({ success: false, message: error.message || "Error al registrar el producto" });
  }
};

// Actualizar un producto
export const updateProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      categoria_producto_id,
      producto_codigo,
      producto_nombre,
      producto_descripcion,
      producto_precio_unitario,
      producto_stock_actual,
      producto_stock_minimo,
      producto_unidad_medida,
      producto_estado,
    } = req.body;

    const productoExistente = await prisma.tbl_producto.findUnique({
      where: { producto_id: Number(id) },
    });

    if (!productoExistente) {
      res.status(404).json({ success: false, message: "Producto no encontrado" });
      return;
    }

    const productoActualizado = await prisma.tbl_producto.update({
      where: { producto_id: Number(id) },
      data: {
        categoria_producto_id: categoria_producto_id ? Number(categoria_producto_id) : undefined,
        producto_codigo: producto_codigo ? producto_codigo.trim() : undefined,
        producto_nombre: producto_nombre ? producto_nombre.trim() : undefined,
        producto_descripcion: producto_descripcion !== undefined ? producto_descripcion.trim() : undefined,
        producto_precio_unitario: producto_precio_unitario !== undefined ? Number(producto_precio_unitario) : undefined,
        producto_stock_actual: producto_stock_actual !== undefined ? Number(producto_stock_actual) : undefined,
        producto_stock_minimo: producto_stock_minimo !== undefined ? Number(producto_stock_minimo) : undefined,
        producto_unidad_medida: producto_unidad_medida ? producto_unidad_medida.trim() : undefined,
        producto_estado: producto_estado !== undefined ? producto_estado : undefined,
      },
      include: {
        categoria: true,
      },
    });

    res.json({ success: true, message: "Producto actualizado correctamente", data: productoActualizado });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al actualizar el producto" });
  }
};

// Eliminar o desactivar un producto
export const deleteProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.tbl_producto.delete({
      where: { producto_id: Number(id) },
    });

    res.json({ success: true, message: "Producto eliminado correctamente" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al eliminar el producto" });
  }
};
