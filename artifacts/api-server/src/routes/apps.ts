import { Router, type IRouter } from "express";
import { eq, ilike, and, sql } from "drizzle-orm";
import { db, appsTable } from "@workspace/db";
import {
  ListAppsQueryParams,
  ListAppsResponse,
  CreateAppBody,
  GetAppParams,
  GetAppResponse,
  UpdateAppParams,
  UpdateAppBody,
  UpdateAppResponse,
  DeleteAppParams,
  GetAppStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/apps", async (req, res): Promise<void> => {
  const query = ListAppsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];

  if (query.data.search) {
    conditions.push(ilike(appsTable.name, `%${query.data.search}%`));
  }
  if (query.data.type) {
    conditions.push(eq(appsTable.type, query.data.type));
  }
  if (query.data.category) {
    conditions.push(eq(appsTable.category, query.data.category));
  }
  if (query.data.status) {
    conditions.push(eq(appsTable.status, query.data.status));
  }

  const apps = await db
    .select()
    .from(appsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(appsTable.createdAt);

  res.json(ListAppsResponse.parse(apps));
});

router.post("/apps", async (req, res): Promise<void> => {
  const parsed = CreateAppBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [app] = await db.insert(appsTable).values(parsed.data).returning();
  res.status(201).json(GetAppResponse.parse(app));
});

router.get("/apps/stats", async (_req, res): Promise<void> => {
  const allApps = await db.select().from(appsTable);
  const totalMods = allApps.length;
  const totalGames = allApps.filter((a) => a.type === "GAME").length;
  const totalApps = allApps.filter((a) => a.type === "APP").length;
  const totalOnline = allApps.filter((a) => a.status === "ONLINE").length;
  const totalOffline = allApps.filter((a) => a.status === "OFFLINE").length;

  res.json(
    GetAppStatsResponse.parse({
      totalMods,
      totalGames,
      totalApps,
      totalOnline,
      totalOffline,
    }),
  );
});

router.get("/apps/:id", async (req, res): Promise<void> => {
  const params = GetAppParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [app] = await db
    .select()
    .from(appsTable)
    .where(eq(appsTable.id, params.data.id));

  if (!app) {
    res.status(404).json({ error: "App not found" });
    return;
  }

  res.json(GetAppResponse.parse(app));
});

router.put("/apps/:id", async (req, res): Promise<void> => {
  const params = UpdateAppParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAppBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) {
      updateData[key] = value;
    }
  }

  const [app] = await db
    .update(appsTable)
    .set(updateData)
    .where(eq(appsTable.id, params.data.id))
    .returning();

  if (!app) {
    res.status(404).json({ error: "App not found" });
    return;
  }

  res.json(UpdateAppResponse.parse(app));
});

router.delete("/apps/:id", async (req, res): Promise<void> => {
  const params = DeleteAppParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [app] = await db
    .delete(appsTable)
    .where(eq(appsTable.id, params.data.id))
    .returning();

  if (!app) {
    res.status(404).json({ error: "App not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
