<script setup lang="ts">
import type { AnyRecord, NamedItem, SchemaRow } from '@/types/asyncapi'
import SectionHeading from './SectionHeading.vue'

defineProps<{
  schemaRows: (schema: AnyRecord) => SchemaRow[]
  schemas: NamedItem[]
}>()
</script>

<template>
  <section id="schemas" class="doc-section">
    <SectionHeading eyebrow="Data model" title="Schemas" :meta="`${schemas.length} visible`" />

    <article v-for="schema in schemas" :id="schema.id" :key="schema.key" class="schema-card">
      <div class="schema-heading">
        <div>
          <span class="method-pill schema">{{ schema.value.type || 'schema' }}</span>
          <h3>{{ schema.key }}</h3>
        </div>
        <p>{{ schema.value.description }}</p>
      </div>

      <div class="property-table">
        <div class="property-row header">
          <span>Property</span>
          <span>Type</span>
          <span>Required</span>
        </div>
        <div v-for="row in schemaRows(schema.value)" :key="row.key" class="property-row">
          <span>
            <code>{{ row.key }}</code>
            <small v-if="row.description">{{ row.description }}</small>
            <small v-if="row.enum">enum: {{ row.enum }}</small>
          </span>
          <span>{{ row.type }}</span>
          <span>{{ row.required ? 'Yes' : 'No' }}</span>
        </div>
      </div>
    </article>
  </section>
</template>
