import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { createBrandWorkflow } from "../../../workflows/brand/create"
import brand from "../../../modules/brand"
import { z } from "zod"
import { PostAdminCreateBrand } from "./validators"


type PostAdminCreateBrandType = z.infer<typeof PostAdminCreateBrand>

export const POST = async (
    req: MedusaRequest<PostAdminCreateBrandType>,
    res: MedusaResponse,
) => {
    const { result } = await createBrandWorkflow(req.scope).run({
        input: req.validatedBody,
    })
    res.json({ brand: result })
}

//get brands with there linked products
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse,
) => {
    const query = req.scope.resolve("query")

    const {
        data: brandsWithProducts,
        metadata: { count, take, skip } = {}
    } = await query.graph({
        entity: "brand",
        ...req.queryConfig,
    })

    // Transform the response to include product counts only
    const brands = brandsWithProducts.map(brand => {
        // Extract only what we need from the brand
        return {
            id: brand.id,
            name: brand.name,
            product_count: brand.products?.length || 0,
            // Exclude the products array completely
        }
    })

    res.json({
        brands,
        count,
        limit: take,
        offset: skip
    })
}
