<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="text" indent="yes" encoding="UTF-8" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" />

<xsl:template match="/">
	   [<xsl:apply-templates/>]
</xsl:template>

<xsl:template match="httpSample">
    {<xsl:value-of select="@ts"/>,
    <xsl:value-of select="@t"/>}
    <xsl:value-of select="position()"/>
    <xsl:if test="position() != last()">,</xsl:if>
	<xsl:if test="position() = last()"><xsl:text>-----</xsl:text></xsl:if>
  <!--<xsl:apply-templates/>-->
</xsl:template>

</xsl:stylesheet>