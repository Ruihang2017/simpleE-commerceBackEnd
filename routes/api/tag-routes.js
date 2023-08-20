const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

router.get("/", async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product, through: ProductTag, as: "tag_products" }],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag, as: "tag_products" }],
    });
    if (!tagData) {
      res.status(404).json({ message: "No tag has been found with this id!" });
      return;
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  // create a new tag
  try {
    const newTag = await Tag.create(req.body);

    if (req.body.productIds.length) {
      const productTagArr = req.body.productIds.map((productIds) => {
        return {
          product_id: productIds,
          tag_id: newTag.id,
        };
      });
      res.status(200).json(await ProductTag.bulkCreate(productTagArr));
    } else {
      res.status(200).json(newTag);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id", async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const tag = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (req.body.productIds && req.body.productIds.length) {
      const productTags = await ProductTag.findAll({
        where: { tag_id: req.params.id },
      });

      const productTagIds = productTags.map(({ product_id }) => product_id);

      const newProductTags = req.body.productIds
        .filter((productIds) => {
          return productIds;
        })
        .map((productIds) => {
          return {
            product_id: productIds,
            tag_id: req.params.id,
          };
        });

      const productTagsToRemove = productTags
        .filter(({ product_id }) => {
          return !req.body.productIds.includes(product_id);
        })
        .map(({ id }) => {
          return id;
        });

      console.log(productTagsToRemove);
      console.log(newProductTags);

      await ProductTag.destroy({ where: { id: productTagsToRemove } });
      await ProductTag.bulkCreate(newProductTags);
    }

    res.status(200).json(tag);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!tagData) {
      res.status(404).json({ message: "No tagData found with this id!" });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
