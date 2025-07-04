import mongoose, { Model } from 'mongoose'
import * as env from '../config/env.config'
import * as logger from './logger'
import Category from '../models/Category'
import Value from '../models/Value'

/**
 * Synchronizes multilingual Value entries for a given collection (such as Location, Country, or ParkingSpot) 
 * to ensure that each document has language-specific values for all supported languages defined in env.LANGUAGES.
 *
 * @async
 * @param {Model<T>} collection 
 * @param {string} label 
 * @returns {Promise<boolean>}
 */
const syncLanguageValues = async <T extends { values: (mongoose.Types.ObjectId | env.Value)[] }>(
  collection: Model<T>,
  label: string
): Promise<boolean> => {
  try {
    // Load all documents with populated 'values' field
    const docs = await collection.find({}).populate<{ values: env.Value[] }>({
      path: 'values',
      model: 'Value',
    })

    const newValues: env.Value[] = []
    const updates: { id: string; pushIds: string[] }[] = []

    for (const doc of docs) {
      // Ensure English value exists to copy from
      const en = doc.values.find((v) => v.language === 'en')
      if (!en) {
        logger.warn(`English value missing for ${label} document:`, doc.id)
        continue
      }

      // Find which languages are missing
      const missingLangs = env.LANGUAGES.filter((lang) => !doc.values.some((v) => v.language === lang))

      if (missingLangs.length > 0) {
        const additions: string[] = []
        for (const lang of missingLangs) {
          // Create new Value with English value as fallback
          const val = new Value({ language: lang, value: en.value })
          newValues.push(val)
          additions.push(val.id)
        }
        updates.push({ id: doc.id, pushIds: additions })
      }
    }

    // Insert all newly created Values in one batch for efficiency
    if (newValues.length > 0) {
      await Value.insertMany(newValues)
      logger.info(`Inserted ${newValues.length} new Value docs for ${label}`)
    }

    // Update documents by pushing the new Value references
    if (updates.length > 0) {
      const bulkOps = updates.map(({ id, pushIds }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $push: { values: { $each: pushIds } } },
        },
      }))
      await collection.bulkWrite(bulkOps)
      logger.info(`Updated ${updates.length} ${label} documents with new language values`)
    }

    // Cleanup: Delete Values with unsupported languages and remove references
    const cursor = Value.find({ language: { $nin: env.LANGUAGES } }, { _id: 1 }).cursor()
    let obsoleteIdsBatch: string[] = []

    for await (const obsoleteVal of cursor) {
      obsoleteIdsBatch.push(obsoleteVal.id)

      if (obsoleteIdsBatch.length >= env.BATCH_SIZE) {
        await Promise.all([
          collection.updateMany({ values: { $in: obsoleteIdsBatch } }, { $pull: { values: { $in: obsoleteIdsBatch } } }),
          Value.deleteMany({ _id: { $in: obsoleteIdsBatch } }),
        ])
        logger.info(`Cleaned up batch of ${obsoleteIdsBatch.length} obsolete Values in ${label}`)
        obsoleteIdsBatch = []
      }
    }

    // Final cleanup for any remaining obsolete ids after loop
    if (obsoleteIdsBatch.length > 0) {
      await Promise.all([
        collection.updateMany({ values: { $in: obsoleteIdsBatch } }, { $pull: { values: { $in: obsoleteIdsBatch } } }),
        Value.deleteMany({ _id: { $in: obsoleteIdsBatch } }),
      ])
      logger.info(`Cleaned up final batch of ${obsoleteIdsBatch.length} obsolete Values in ${label}`)
    }

    logger.info(`${label} initialized successfully`)
    return true
  } catch (err) {
    logger.error(`Failed to initialize ${label}:`, err)
    return false
  }
}

/**
 * Initialiazes categories.
 *
 * @returns {Promise<boolean>} 
 */
export const initializeCategories = () => syncLanguageValues(Category, 'categories')
