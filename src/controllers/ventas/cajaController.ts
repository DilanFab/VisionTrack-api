import { Request, Response } from "express";
import * as cajaService from "../../services/cajaService";

const error = (res: Response, e: any, fallback: string) => res.status(e?.status ?? 500).json({ error: e?.message ?? fallback });

export const listarCajas = async (_req: Request, res: Response) => { try { res.json(await cajaService.listar()); } catch (e) { error(res, e, "Error al listar cajas"); } };
export const obtenerCajaAbierta = async (_req: Request, res: Response) => { try { res.json(await cajaService.obtenerAbierta()); } catch (e) { error(res, e, "Error al obtener caja abierta"); } };
export const abrirCaja = async (req: Request, res: Response) => { try { res.status(201).json(await cajaService.abrir(req.usuario!.usuario_id, req.body.monto_inicial, req.body.observacion)); } catch (e) { error(res, e, "Error al abrir caja"); } };
export const registrarMovimientoCaja = async (req: Request, res: Response) => { try { res.status(201).json(await cajaService.registrarMovimiento(req.usuario!.usuario_id, req.body)); } catch (e) { error(res, e, "Error al registrar movimiento de caja"); } };
export const cerrarCaja = async (req: Request, res: Response) => { try { res.json(await cajaService.cerrar(req.usuario!.usuario_id, Number(req.params.id), req.body)); } catch (e) { error(res, e, "Error al cerrar caja"); } };
