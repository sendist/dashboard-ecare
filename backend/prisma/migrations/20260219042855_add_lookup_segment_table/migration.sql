-- CreateTable
CREATE TABLE "lookup_segment" (
    "id" SERIAL NOT NULL,
    "account" TEXT,
    "source_name" TEXT,
    "account_source_name" TEXT,
    "segment" TEXT,
    "tambahan" TEXT,

    CONSTRAINT "lookup_segment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lookup_segment_account_source_name_idx" ON "lookup_segment"("account_source_name");

-- CreateIndex
CREATE INDEX "lookup_segment_segment_idx" ON "lookup_segment"("segment");

-- CreateIndex
CREATE INDEX "lookup_segment_tambahan_idx" ON "lookup_segment"("tambahan");
