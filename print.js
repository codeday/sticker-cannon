// For printing stickers from the database
// Note: this code is pretty specialized for use on my computer, don't expect it to work for you without a good bit of fiddling
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const Dymo = require('dymojs')
const yargs = require('yargs')
require('dotenv').config()
yargs
  .scriptName("print")
  .usage('$0 <cmd> [args]')
  .command('test', 'Print a test address and return label', (yargs) => {}, async function (argv) {
    await print({
      first_name: 'Testing',
      last_name: 'Tester',
      line_1: '123 Test St',
      line_2: 'Apt 1Q',
      city: 'Florida City',
      state: 'Florida',
      zip: '12345',
      country: 'United States'
    })
  })
  .command('metadata [metadata]', 'Print return labels and addresses for all unprinted labels with the given metadata', (yargs => {
  yargs.positional('metadata', {
    type: 'string',
    describe: 'the metadata value to print'
  })
  }),
   async function (argv) {
    const toPrint = await prisma.address.findMany(
    {where: {printed: false, metadata: argv.metadata}}
  )
     console.log(`Printing ${toPrint.length} labels`)
     for (const address of toPrint) {
    try{
    await print(address)
    await prisma.address.update({
      where: {id: address.id},
      data: {printed: true},
    })
    }
    catch(e) {
      console.log(`error printing label for ${address.first_name}`)
      console.error(e, address)
    }
  }
  await prisma.$disconnect()
   }
  )
  .help()
  .argv
async function print(address) {
    dymo = new Dymo();
    // i reccomend collapsing the xml files, i was too lazy to figure out importing them from somewhere else (i did try), i'm the only one who uses this anyways
    // xml for CodeDay logo (return label)
    var logoXml = `<?xml version="1.0" encoding="utf-8"?>
<DesktopLabel Version="1">
  <DYMOLabel Version="3">
    <Description>DYMO Label</Description>
    <Orientation>Landscape</Orientation>
    <LabelName>Address30251</LabelName>
    <InitialLength>0</InitialLength>
    <BorderStyle>SolidLine</BorderStyle>
    <DYMORect>
      <DYMOPoint>
        <X>0.23</X>
        <Y>0.06</Y>
      </DYMOPoint>
      <Size>
        <Width>3.21</Width>
        <Height>0.9966667</Height>
      </Size>
    </DYMORect>
    <BorderColor>
      <SolidColorBrush>
        <Color A="1" R="0" G="0" B="0"></Color>
      </SolidColorBrush>
    </BorderColor>
    <BorderThickness>1</BorderThickness>
    <Show_Border>False</Show_Border>
    <DynamicLayoutManager>
      <RotationBehavior>ClearObjects</RotationBehavior>
      <LabelObjects>
        <ImageObject>
          <Name>IImageObject0</Name>
          <Brushes>
            <BackgroundBrush>
              <SolidColorBrush>
                <Color A="0" R="0" G="0" B="0"></Color>
              </SolidColorBrush>
            </BackgroundBrush>
            <BorderBrush>
              <SolidColorBrush>
                <Color A="1" R="0" G="0" B="0"></Color>
              </SolidColorBrush>
            </BorderBrush>
            <StrokeBrush>
              <SolidColorBrush>
                <Color A="1" R="0" G="0" B="0"></Color>
              </SolidColorBrush>
            </StrokeBrush>
            <FillBrush>
              <SolidColorBrush>
                <Color A="0" R="0" G="0" B="0"></Color>
              </SolidColorBrush>
            </FillBrush>
          </Brushes>
          <Rotation>Rotation0</Rotation>
          <OutlineThickness>1</OutlineThickness>
          <IsOutlined>False</IsOutlined>
          <BorderStyle>SolidLine</BorderStyle>
          <Margin>
            <DYMOThickness Left="0" Top="0" Right="0" Bottom="0" />
          </Margin>
          <Data>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</Data>
          <ScaleMode>Uniform</ScaleMode>
          <HorizontalAlignment>Center</HorizontalAlignment>
          <VerticalAlignment>Middle</VerticalAlignment>
          <ObjectLayout>
            <DYMOPoint>
              <X>0.6795716</X>
              <Y>0.3008303</Y>
            </DYMOPoint>
            <Size>
              <Width>2.136131</Width>
              <Height>0.4709983</Height>
            </Size>
          </ObjectLayout>
        </ImageObject>
      </LabelObjects>
    </DynamicLayoutManager>
  </DYMOLabel>
  <LabelApplication>Blank</LabelApplication>
  <DataTable>
    <Columns></Columns>
    <Rows></Rows>
  </DataTable>
</DesktopLabel>`;
  // xml for address label
  var labelXml = `<?xml version="1.0" encoding="utf-8"?>
      <DesktopLabel Version="1">
  <DYMOLabel Version="3">
    <Description>DYMO Label</Description>
    <Orientation>Landscape</Orientation>
    <LabelName>Address30251</LabelName>
    <InitialLength>0</InitialLength>
    <BorderStyle>SolidLine</BorderStyle>
    <DYMORect>
      <DYMOPoint>
        <X>0.23</X>
        <Y>0.06</Y>
      </DYMOPoint>
      <Size>
        <Width>3.21</Width>
        <Height>0.9966667</Height>
      </Size>
    </DYMORect>
    <BorderColor>
      <SolidColorBrush>
        <Color A="1" R="0" G="0" B="0"></Color>
      </SolidColorBrush>
    </BorderColor>
    <BorderThickness>1</BorderThickness>
    <Show_Border>False</Show_Border>
    <DynamicLayoutManager>
      <RotationBehavior>ClearObjects</RotationBehavior>
      <LabelObjects>
        <AddressObject>
          <Name>IAddressObject0</Name>
          <Brushes>
            <BackgroundBrush>
              <SolidColorBrush>
                <Color A="0" R="0" G="0" B="0"></Color>
              </SolidColorBrush>
            </BackgroundBrush>
            <BorderBrush>
              <SolidColorBrush>
                <Color A="1" R="0" G="0" B="0"></Color>
              </SolidColorBrush>
            </BorderBrush>
            <StrokeBrush>
              <SolidColorBrush>
                <Color A="1" R="0" G="0" B="0"></Color>
              </SolidColorBrush>
            </StrokeBrush>
            <FillBrush>
              <SolidColorBrush>
                <Color A="0" R="0" G="0" B="0"></Color>
              </SolidColorBrush>
            </FillBrush>
          </Brushes>
          <Rotation>Rotation0</Rotation>
          <OutlineThickness>1</OutlineThickness>
          <IsOutlined>False</IsOutlined>
          <BorderStyle>SolidLine</BorderStyle>
          <Margin>
            <DYMOThickness Left="0" Top="0" Right="0" Bottom="0" />
          </Margin>
          <HorizontalAlignment>Center</HorizontalAlignment>
          <VerticalAlignment>Middle</VerticalAlignment>
          <FitMode>AlwaysFit</FitMode>
          <IsVertical>False</IsVertical>
          <FormattedText>
            <FitMode>AlwaysFit</FitMode>
            <HorizontalAlignment>Center</HorizontalAlignment>
            <VerticalAlignment>Middle</VerticalAlignment>
            <IsVertical>False</IsVertical>
            <LineTextSpan>
              <TextSpan>
                <Text>${address.first_name} ${address.last_name}</Text>
                <FontInfo>
                  <FontName>Segoe UI</FontName>
                  <FontSize>13.2</FontSize>
                  <IsBold>False</IsBold>
                  <IsItalic>False</IsItalic>
                  <IsUnderline>False</IsUnderline>
                  <FontBrush>
                    <SolidColorBrush>
                      <Color A="1" R="0" G="0" B="0"></Color>
                    </SolidColorBrush>
                  </FontBrush>
                </FontInfo>
              </TextSpan>
            </LineTextSpan>
            <LineTextSpan>
              <TextSpan>
                <Text>${address.line_1}</Text>
                <FontInfo>
                  <FontName>Segoe UI</FontName>
                  <FontSize>13.2</FontSize>
                  <IsBold>False</IsBold>
                  <IsItalic>False</IsItalic>
                  <IsUnderline>False</IsUnderline>
                  <FontBrush>
                    <SolidColorBrush>
                      <Color A="1" R="0" G="0" B="0"></Color>
                    </SolidColorBrush>
                  </FontBrush>
                </FontInfo>
              </TextSpan>
            </LineTextSpan>
            <LineTextSpan>
              <TextSpan>
                <Text>${address.line_2 || ''}</Text>
                <FontInfo>
                  <FontName>Segoe UI</FontName>
                  <FontSize>13.2</FontSize>
                  <IsBold>False</IsBold>
                  <IsItalic>False</IsItalic>
                  <IsUnderline>False</IsUnderline>
                  <FontBrush>
                    <SolidColorBrush>
                      <Color A="1" R="0" G="0" B="0"></Color>
                    </SolidColorBrush>
                  </FontBrush>
                </FontInfo>
              </TextSpan>
            </LineTextSpan>
            <LineTextSpan>
              <TextSpan>
                <Text>${address.city}, ${address.state}, ${address.zip}</Text>
                <FontInfo>
                  <FontName>Segoe UI</FontName>
                  <FontSize>13.2</FontSize>
                  <IsBold>False</IsBold>
                  <IsItalic>False</IsItalic>
                  <IsUnderline>False</IsUnderline>
                  <FontBrush>
                    <SolidColorBrush>
                      <Color A="1" R="0" G="0" B="0"></Color>
                    </SolidColorBrush>
                  </FontBrush>
                </FontInfo>
              </TextSpan>
            </LineTextSpan>
            <LineTextSpan>
              <TextSpan>
                <Text>${address.country}</Text>
                <FontInfo>
                  <FontName>Segoe UI</FontName>
                  <FontSize>13.2</FontSize>
                  <IsBold>False</IsBold>
                  <IsItalic>False</IsItalic>
                  <IsUnderline>False</IsUnderline>
                  <FontBrush>
                    <SolidColorBrush>
                      <Color A="1" R="0" G="0" B="0"></Color>
                    </SolidColorBrush>
                  </FontBrush>
                </FontInfo>
              </TextSpan>
            </LineTextSpan>
          </FormattedText>
          <BarcodePosition>None</BarcodePosition>
          <ObjectLayout>
            <DYMOPoint>
              <X>0.2372831</X>
              <Y>0.06000001</Y>
            </DYMOPoint>
            <Size>
              <Width>3.202717</Width>
              <Height>0.9966665</Height>
            </Size>
          </ObjectLayout>
        </AddressObject>
      </LabelObjects>
    </DynamicLayoutManager>
  </DYMOLabel>
  <LabelApplication>Blank</LabelApplication>
  <DataTable>
    <Columns></Columns>
    <Rows></Rows>
  </DataTable>
</DesktopLabel>`;

  await dymo.print('DYMO LabelWriter 450', labelXml)
  await dymo.print('DYMO LabelWriter 450', logoXml)
}


// async function main() {
//   const toPrint = await prisma.address.findMany(
//     {where: {printed: false}}
//   )
//   for (const address of toPrint) {
//     try{
//     await print(address)
//     await prisma.address.update({
//       where: {id: address.id},
//       data: {printed: true},
//     })
//     }
//     catch(e) {
//       console.log(`error printing label for ${address.first_name}`)
//       console.error(e, address)
//     }
//   }
// }
// main()
//   .catch(e => {
//     throw e
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })